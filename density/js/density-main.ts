// Copyright 2019-2025, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DensityBuoyancyCommonCredits from '../../density-buoyancy-common/js/common/DensityBuoyancyCommonCredits.js';
import DensityBuoyancyCommonPreferencesNode from '../../density-buoyancy-common/js/common/view/DensityBuoyancyCommonPreferencesNode.js';
import '../../scenery-phet/js/accessibility/describers/Alerter.js';
import PreferencesModel from '../../joist/js/preferences/PreferencesModel.js';
import Sim, { SimOptions } from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import CompareScreen from './compare/CompareScreen.js';
import DensityStrings from './DensityStrings.js';
import IntroScreen from './intro/IntroScreen.js';
import MysteryScreen from './mystery/MysteryScreen.js';

const simOptions: SimOptions = {
  credits: DensityBuoyancyCommonCredits,
  webgl: true,

  preferencesModel: new PreferencesModel( {
    simulationOptions: {
      customPreferences: [ {
        createContent: tandem => new DensityBuoyancyCommonPreferencesNode( { tandem: tandem } )
      } ]
    }
  } ),

  // phet-io options
  phetioDesigned: true
};

// launch the sim - beware that scenery Image nodes created outside of simLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch( () => {

  const sim = new Sim( DensityStrings.density.titleStringProperty, [
    new IntroScreen( Tandem.ROOT.createTandem( 'introScreen' ) ),
    new CompareScreen( Tandem.ROOT.createTandem( 'compareScreen' ) ),
    new MysteryScreen( Tandem.ROOT.createTandem( 'mysteryScreen' ) )
  ], simOptions );

  sim.start();
} );