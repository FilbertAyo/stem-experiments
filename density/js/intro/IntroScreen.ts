// Copyright 2019-2024, University of Colorado Boulder

/**
 * Intro screen for Density
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DensityBuoyancyCommonColors from '../../../density-buoyancy-common/js/common/view/DensityBuoyancyCommonColors.js';
import DensityBuoyancyCommonKeyboardHelpNode from '../../../density-buoyancy-common/js/common/view/DensityBuoyancyCommonKeyboardHelpNode.js';
import DensityBuoyancyScreenView from '../../../density-buoyancy-common/js/common/view/DensityBuoyancyScreenView.js';
import DensityIntroModel from '../../../density-buoyancy-common/js/density/model/DensityIntroModel.js';
import DensityIntroScreenView from '../../../density-buoyancy-common/js/density/view/DensityIntroScreenView.js';
import getDensityIntroIcon from '../../../density-buoyancy-common/js/density/view/getDensityIntroIcon.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import Tandem from '../../../tandem/js/Tandem.js';
import intro_screen_icon_png from '../../mipmaps/intro_screen_icon_png.js';
import density from '../density.js';
import DensityStrings from '../DensityStrings.js';

export default class IntroScreen extends Screen<DensityIntroModel, DensityIntroScreenView> {
  public constructor( tandem: Tandem ) {
    const icon = DensityBuoyancyScreenView.getThreeIcon( intro_screen_icon_png, () => getDensityIntroIcon() );

    super(
      () => new DensityIntroModel( {
        tandem: tandem.createTandem( 'model' )
      } ),
      model => new DensityIntroScreenView( model, {
        tandem: tandem.createTandem( 'view' )
      } ),
      {
        name: DensityStrings.screen.introStringProperty,
        backgroundColorProperty: DensityBuoyancyCommonColors.skyBottomProperty,
        homeScreenIcon: new ScreenIcon( icon, {
          maxIconWidthProportion: 1,
          maxIconHeightProportion: 1
        } ),
        tandem: tandem,
        createKeyboardHelpNode: () => new DensityBuoyancyCommonKeyboardHelpNode( true, true )
      }
    );
  }
}

density.register( 'IntroScreen', IntroScreen );