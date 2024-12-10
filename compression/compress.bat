rem java -jar compiler.jar --help

java -jar compiler.jar --js ../js/chrome-background.js  --js_output_file ../compiled_js/chrome-background.js
java -jar compiler.jar --js ../js/chrome-content.js  --js_output_file ../compiled_js/chrome-content.js
java -jar compiler.jar --js ../js/basecamp-extension.js  --js_output_file ../compiled_js/basecamp-extension.js
java -jar compiler.jar --js ../js/options.js  --js_output_file ../compiled_js/options.js
java -jar compiler.jar --js ../js/time-graph.js  --js_output_file ../compiled_js/time-graph.js

rem xcopy "..\js\jquery-1.4.2.min.js"  "..\compiled_js\jquery-1.4.2.min.js" /Y

pause