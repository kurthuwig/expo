import { css } from '@emotion/react';
import { breakpoints, theme } from '@expo/styleguide';
import Router, { useRouter } from 'next/router';
import { useEffect, useState, createRef } from 'react';

import * as RoutesUtils from '~/common/routes';
import * as Utilities from '~/common/utilities';
import * as WindowUtils from '~/common/window';
import DocumentationNestedScrollLayout from '~/components/DocumentationNestedScrollLayout';
import DocumentationSidebarRight, {
  SidebarRightComponentType,
} from '~/components/DocumentationSidebarRight';
import Head from '~/components/Head';
import { usePageApiVersion } from '~/providers/page-api-version';
import { Footer } from '~/ui/components/Footer';
import { Header } from '~/ui/components/Header';
import { Sidebar } from '~/ui/components/Sidebar';
import { H1 } from '~/ui/components/Text';

const STYLES_DOCUMENT = css`
  background: ${theme.background.default};
  margin: 0 auto;
  padding: 40px 56px;

  @media screen and (max-width: ${breakpoints.medium + 124}px) {
    padding: 20px 16px 48px 16px;
  }
`;

type Props = React.PropsWithChildren<{
  title?: string;
  description?: string;
  sourceCodeUrl?: string;
  tocVisible: boolean;
  packageName?: string;
  /** If the page should not show up in the Algolia Docsearch results */
  hideFromSearch?: boolean;
}>;

const getCanonicalUrl = (path: string) => {
  if (RoutesUtils.isReferencePath(path)) {
    return `https://docs.expo.dev${Utilities.replaceVersionInUrl(path, 'latest')}`;
  } else {
    return `https://docs.expo.dev${path}`;
  }
};

export default function DocumentationPage(props: Props) {
  const { version } = usePageApiVersion();
  const { pathname } = useRouter();

  const layoutRef = createRef<DocumentationNestedScrollLayout>();
  const sidebarRightRef = createRef<SidebarRightComponentType>();

  const [isMobileMenuVisible, setMobileMenuVisible] = useState(false);

  const routes = RoutesUtils.getRoutes(pathname, version);
  const sidebarActiveGroup = RoutesUtils.getPageSection(pathname);
  const sidebarScrollPosition = process.browser ? window.__sidebarScroll : 0;

  useEffect(() => {
    Router.events.on('routeChangeStart', url => {
      if (layoutRef.current) {
        if (
          RoutesUtils.getPageSection(pathname) !== RoutesUtils.getPageSection(url) ||
          pathname === '/'
        ) {
          window.__sidebarScroll = 0;
        } else {
          window.__sidebarScroll = layoutRef.current.getSidebarScrollTop();
        }
      }
    });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  const handleResize = () => {
    if (WindowUtils.getViewportSize().width >= breakpoints.medium + 124) {
      setMobileMenuVisible(false);
      window.scrollTo(0, 0);
    }
  };

  const handleContentScroll = (contentScrollPosition: number) => {
    window.requestAnimationFrame(() => {
      if (sidebarRightRef && sidebarRightRef.current) {
        sidebarRightRef.current.handleContentScroll(contentScrollPosition);
      }
    });
  };

  const sidebarElement = <Sidebar routes={routes} />;
  const sidebarRightElement = <DocumentationSidebarRight ref={sidebarRightRef} />;
  const headerElement = (
    <Header
      sidebar={sidebarElement}
      sidebarActiveGroup={sidebarActiveGroup}
      isMobileMenuVisible={isMobileMenuVisible}
      setMobileMenuVisible={newState => setMobileMenuVisible(newState)}
    />
  );

  return (
    <DocumentationNestedScrollLayout
      ref={layoutRef}
      header={headerElement}
      sidebar={sidebarElement}
      sidebarRight={sidebarRightElement}
      sidebarActiveGroup={sidebarActiveGroup}
      tocVisible={props.tocVisible}
      isMobileMenuVisible={isMobileMenuVisible}
      onContentScroll={handleContentScroll}
      sidebarScrollPosition={sidebarScrollPosition}>
      <Head title={props.title} description={props.description}>
        {props.hideFromSearch !== true && (
          <meta
            name="docsearch:version"
            content={RoutesUtils.isReferencePath(pathname) ? version : 'none'}
          />
        )}
        {version === 'unversioned' ? (
          (RoutesUtils.isPreviewPath(pathname) || RoutesUtils.isArchivePath(pathname)) && (
            <meta name="robots" content="noindex" />
          )
        ) : (
          <link rel="canonical" href={getCanonicalUrl(pathname)} />
        )}
      </Head>
      <div css={STYLES_DOCUMENT}>
        {props.title && <H1>{props.title}</H1>}
        {props.children}
        {props.title && (
          <Footer
            title={props.title}
            sourceCodeUrl={props.sourceCodeUrl}
            packageName={props.packageName}
          />
        )}
      </div>
    </DocumentationNestedScrollLayout>
  );
}
