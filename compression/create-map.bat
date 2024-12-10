rem java -jar compiler.jar --help

java -jar compiler.jar --js ../js/LanguageTools.js  --js_output_file ../../Live/js/LanguageTools.js   --compilation_level ADVANCED_OPTIMIZATIONS  --property_map_output_file ../js/LanguageTools.map
java -jar compiler.jar --js ../js/Boomarklet.js  --js_output_file ../../Live/js/Boomarklet.js --compilation_level ADVANCED_OPTIMIZATIONS  --property_map_output_file ../js/Boomarklet.map
