// Copyright 2019-2024, University of Colorado Boulder

/**
 * Compare screen for Density
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DensityBuoyancyCommonColors from '../../../density-buoyancy-common/js/common/view/DensityBuoyancyCommonColors.js';
import DensityBuoyancyCommonKeyboardHelpNode from '../../../density-buoyancy-common/js/common/view/DensityBuoyancyCommonKeyboardHelpNode.js';
import DensityBuoyancyScreenView from '../../../density-buoyancy-common/js/common/view/DensityBuoyancyScreenView.js';
import DensityCompareModel from '../../../density-buoyancy-common/js/density/model/DensityCompareModel.js';
import DensityCompareScreenView from '../../../density-buoyancy-common/js/density/view/DensityCompareScreenView.js';
import getDensityCompareIcon from '../../../density-buoyancy-common/js/density/view/getDensityCompareIcon.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import Tandem from '../../../tandem/js/Tandem.js';
import compare_screen_icon_png from '../../mipmaps/compare_screen_icon_png.js';
import density from '../density.js';
import DensityStrings from '../DensityStrings.js';

export default class CompareScreen extends Screen<DensityCompareModel, DensityCompareScreenView> {
  public constructor( tandem: Tandem ) {
    const icon = DensityBuoyancyScreenView.getThreeIcon( compare_screen_icon_png, () => getDensityCompareIcon() );

    super(
      () => new DensityCompareModel( {
        tandem: tandem.createTandem( 'model' )
      } ),
      model => new DensityCompareScreenView( model, {
        tandem: tandem.createTandem( 'view' )
      } ),
      {
        name: DensityStrings.screen.compareStringProperty,
        backgroundColorProperty: DensityBuoyancyCommonColors.skyBottomProperty,
        homeScreenIcon: new ScreenIcon( icon, {
          maxIconWidthProportion: 1,
          maxIconHeightProportion: 1
        } ),
        tandem: tandem,
        createKeyboardHelpNode: () => new DensityBuoyancyCommonKeyboardHelpNode( true, false )
      }
    );
  }
}

density.register( 'CompareScreen', CompareScreen );