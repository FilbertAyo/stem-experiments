commands on vps

root@server1:/var/www/lab.adilishastemlabs.com/repo# sudo -u www-data git -C /var/www/lab.adilishastemlabs.com/repo pull origin main
remote: Enumerating objects: 14501, done.
remote: Counting objects: 100% (1/1), done.
remote: Total 14501 (delta 1), reused 1 (delta 1), pack-reused 14500 (from 1)
Receiving objects: 100% (14501/14501), 122.46 MiB | 15.43 MiB/s, done.
Resolving deltas: 100% (9564/9564), completed with 1 local object.
From https://github.com/FilbertAyo/stem-experiments
 * branch            main       -> FETCH_HEAD
   5d7869f..2c50004  main       -> origin/main
Updating 5d7869f..2c50004
error: The following untracked working tree files would be overwritten by merge:
	axon/.github/pull_request_template.md
	axon/.gitignore
	axon/CLAUDE.md
	axon/Gruntfile.cjs
	axon/LICENSE
	axon/README.md
	axon/axon-tests.html
	axon/eslint.config.mjs
	axon/js/AccessibleStrings.ts
	axon/js/BooleanProperty.ts
	axon/js/BooleanPropertyTests.ts
	axon/js/CallbackTimer.ts
	axon/js/DerivedProperty.ts
	axon/js/DerivedPropertyTests.ts
	axon/js/DerivedStringProperty.ts
	axon/js/Disposable.ts
	axon/js/DisposableTests.ts
	axon/js/DynamicProperty.ts
	axon/js/DynamicPropertyTests.ts
	axon/js/Emitter.ts
	axon/js/EmitterIOTests.ts
	axon/js/EmitterTests.ts
	axon/js/EnabledComponent.ts
	axon/js/EnabledComponentTests.ts
	axon/js/EnabledProperty.ts
	axon/js/EnumerationProperty.ts
	axon/js/EnumerationPropertyTests.ts
	axon/js/GatedBooleanProperty.ts
	axon/js/GatedBooleanPropertyTests.ts
	axon/js/GatedEnabledProperty.ts
	axon/js/GatedVisibleProperty.ts
	axon/js/MappedProperty.ts
	axon/js/Multilink.ts
	axon/js/NumberProperty.ts
	axon/js/NumberPropertyTests.ts
	axon/js/ObservableArrayDef.ts
	axon/js/PatternStringProperty.ts
	axon/js/PatternStringPropertyTests.ts
	axon/js/PhetioProperty.ts
	axon/js/PhetioReadOnlyProperty.ts
	axon/js/Property.ts
	axon/js/PropertyStateHandler.ts
	axon/js/PropertyStateHandlerTests.ts
	axon/js/PropertyStatePhase.ts
	axon/js/PropertyTests.ts
	axon/js/RangedDynamicProperty.ts
	axon/js/ReadOnlyProperty.ts
	axon/js/StringProperty.ts
	axon/js/StringPropertyTests.ts
	axon/js/StringUnionProperty.ts
	axon/js/TCollapsePropertyValue.ts
	axon/js/TEmitter.ts
	axon/js/TProperty.ts
	axon/js/TRangedProperty.ts
	axon/js/TReadOnlyProperty.ts
	axon/js/Timer.ts
	axon/js/TinyEmitter.ts
	axon/js/TinyEmitterTests.ts
	axon/js/TinyForwardingProperty.ts
	axon/js/TinyForwardingPropertyTests.ts
	axon/js/TinyOverrideProperty.ts
	axon/js/TinyOverridePropertyTests.ts
	axon/js/TinyProperty.ts
	axon/js/TinyPropertyTests.ts
	axon/js/TinyStaticProperty.ts
	axon/js/Unit.ts
	axon/js/UnitConversionProperty.ts
	axon/js/Validation.ts
	axon/js/ValidationTests.ts
	axon/js/VarianceNumberProperty.ts
	axon/js/VarianceNumberPropertyTests.ts
	axon/js/animationFrameTimer.ts
	axon/js/axon-phet-io-overrides.js
	axon/js/axon-tests.ts
	axon/js/axon.ts
	axon/js/createObservableArray.ts
	axon/js/createObservableArrayTests.ts
	axon/js/derived.ts
	axon/js/derivedMap.ts
	axon/js/derivedTernary.ts
	axon/js/main.ts
	axon/js/stepTimer.ts
	axon/js/units.ts
	axon/js/validate.ts
	axon/package.json
	axon/tsconfig.json
	chipper/.github/pull_request_template.md
	chipper/.gitignore
	chipper/.swcrc
	chipper/Gruntfile.cjs
	chipper/LICENSE
	chipper/README.md
	chipper/build.json
	chipper/chipper-tests.html
	chipper/data/localeInfo.json
	chipper/eslint.config.mjs
	chipper/js/browser-and-node/FluentLibrary.ts
	chipper/js/browser-and-node/eslint.config.mjs
	chipper/js/browser-and-node/isInitialStateCompatible.ts
	chipper/js/browser-and-node/phet-types-module.d.ts
	chipper/js/browser-and-node/phetioCompareAPIs.ts
	chipper/js/browser-and-node/tsconfig-dependencies.json
	chipper/js/browser-and-node/tsconfig.json
	chipper/js/browser/FluentComment.ts
	chipper/js/browser/FluentConstant.ts
	chipper/js/browser/FluentContainer.ts
	chipper/js/browser/FluentPattern.ts
	chipper/js/browser/FluentSceneryStack.ts
	chipper/js/browser/FluentUtils.ts
	chipper/js/browser/LocalizedMessageProperty.ts
	chipper/js/browser/LocalizedString.ts
	chipper/js/browser/LocalizedStringProperty.ts
	chipper/js/browser/MipmapElement.ts
	chipper/js/browser/MipmapElementTests.ts
	chipper/js/browser/PatternMessageProperty.ts
	chipper/js/browser/chipper-tests.ts
	chipper/js/browser/chipper.ts
	chipper/js/browser/createFluentMessageProperty.ts
	chipper/js/browser/eslint.config.mjs
	chipper/js/browser/getFluentModule.ts
	chipper/js/browser/getStringModule.ts
	chipper/js/browser/ie-detection.js
	chipper/js/browser/initialize-globals.js
	chipper/js/browser/isA11yStringKey.ts
	chipper/js/browser/load-unbuilt-strings.js
	chipper/js/browser/localizedStrings.ts
	chipper/js/browser/showFluentTable.ts
	chipper/js/browser/sim-tests/pageloa
Aborting
root@server1:/var/www/lab.adilishastemlabs.com/repo# sudo chown -R www-data:www-data /var/www/lab.adilishastemlabs.com/repo
sudo chmod -R 755 /var/www/lab.adilishastemlabs.com/repo
root@server1:/var/www/lab.adilishastemlabs.com/repo# ls -la assert/js/assert.js
ls -la query-string-machine/js/QueryStringMachine.js
ls: cannot access 'assert/js/assert.js': No such file or directory
ls: cannot access 'query-string-machine/js/QueryStringMachine.js': No such file or directory
root@server1:/var/www/lab.adilishastemlabs.com/repo# curl -I https://lab.adilishastemlabs.com/assert/js/assert.js
curl -I https://lab.adilishastemlabs.com/query-string-machine/js/QueryStringMachine.js
HTTP/2 404 
server: nginx/1.24.0 (Ubuntu)
date: Tue, 20 Jan 2026 16:02:09 GMT
content-type: text/html
content-length: 162

HTTP/2 404 
server: nginx/1.24.0 (Ubuntu)
date: Tue, 20 Jan 2026 16:02:09 GMT
content-type: text/html
content-length: 162

and console

density_en.html:156 
 GET https://lab.adilishastemlabs.com/assert/js/assert.js net::ERR_ABORTED 404 (Not Found)
loadURL	@	density_en.html:156
(anonymous)	@	density_en.html:163
(anonymous)	@	density_en.html:163

density_en.html:156 
 GET https://lab.adilishastemlabs.com/query-string-machine/js/QueryStringMachine.js net::ERR_ABORTED 404 (Not Found)
loadURL	@	density_en.html:156
(anonymous)	@	density_en.html:163
(anonymous)	@	density_en.html:163
initialize-globals.js:34 Uncaught ReferenceError: assert is not defined
    at initialize-globals.js:34:3
    at initialize-globals.js:1367:2
(anonymous)	@	initialize-globals.js:34
(anonymous)	@	initialize-globals.js:1367
splash.svg:1 
 GET https://lab.adilishastemlabs.com/brand/adapted-from-phet/images/splash.svg 404 (Not Found)
Image		
(anonymous)	@	splash.js:216
(anonymous)	@	splash.js:252
load-unbuilt-strings.js:174 
 GET https://lab.adilishastemlabs.com/babel/localeData.json 404 (Not Found)
requestJSONFile	@	load-unbuilt-strings.js:174
(anonymous)	@	load-unbuilt-strings.js:236
(anonymous)	@	load-unbuilt-strings.js:272