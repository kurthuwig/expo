//
//  ABI45_0_0AIRGMSPolygon.h
//  AirMaps
//
//  Created by Gerardo Pacheco 02/05/2017.
//

#ifdef ABI45_0_0HAVE_GOOGLE_MAPS

#import <GoogleMaps/GoogleMaps.h>
#import <ABI45_0_0React/ABI45_0_0UIView+React.h>

@class ABI45_0_0AIRGoogleMapPolygon;

@interface ABI45_0_0AIRGMSPolygon : GMSPolygon
@property (nonatomic, strong) NSString *identifier;
@property (nonatomic, copy) ABI45_0_0RCTBubblingEventBlock onPress;
@end

#endif
