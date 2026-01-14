// Copyright 2020-2024, University of Colorado Boulder

/* eslint-disable */
/* @formatter:off */

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */

import getStringModule from '../../chipper/js/browser/getStringModule.js';
import type LocalizedStringProperty from '../../chipper/js/browser/LocalizedStringProperty.js';
import density from './density.js';

type StringsType = {
  'density': {
    'titleStringProperty': LocalizedStringProperty;
  };
  'screen': {
    'introStringProperty': LocalizedStringProperty;
    'compareStringProperty': LocalizedStringProperty;
    'mysteryStringProperty': LocalizedStringProperty;
  }
};

const DensityStrings = getStringModule( 'DENSITY' ) as StringsType;

density.register( 'DensityStrings', DensityStrings );

export default DensityStrings;
