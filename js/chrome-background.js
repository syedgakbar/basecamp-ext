/*  Urdu Transliteration, version 0.4.0
 *  (c) 2009-2010 Syed Ghulam akbar <akbar@jintech.com>
 *
 *   Background Page Library for the Chorme Extension. Binds the Extension actions
 *   and loads and save the Preferences.
 *   http://code.google.com/chrome/extensions/
 *
 *   Modification History
 /*--------------------------------------------------------------------------*/

// Bind the Page Action Click Event.
// For now just show the Prefernces dialog
chrome.pageAction.onClicked.addListener (function(tab) 
    {
        // Show the perferences
        alert("Show Preferences");
    }
);

// Execute the given script in all the Basecamp tabs of each open window
function ExecuteScriptInAllTabs(script)
{
	// Get all the windows list with the default tabs
	chrome.windows.getAll({populate: true}, function(windows) { 
		// Process all the open windows
		for (var w in windows) { 
			// Process all the tabs
			var tabs = windows[w].tabs 
			for (var t in tabs) 
			{ 
				// Check if this is the basecamp URL
				var url = tabs[t].url; 
				var basecampUrlRegExp = /https?:\/\/.*basecamphq\.com/gi;
				basecampUrlRegExp.compile(basecampUrlRegExp); 
						
				if (basecampUrlRegExp.test(url)) { 
					var id = tabs[t].id; 
					chrome.tabs.executeScript(id, {code: script}); 
				} 
			} 
		} 
	}); 
}

// Replace all occurances of the given "find" string with the replace string
String.prototype.replaceAll = function(find, replace) { var regExp = new RegExp(find, "g"); return this.replace(regExp, replace); }

// The event request listner for the Chrome background page
chrome.extension.onRequest.addListener( function(request, sender, sendResponse) {    
    // Handle the request message
    switch (request.message)
    {
        // Show the Page Action button
        case "ShowPageAction":
			if (sender.tab)
			{
				// Set the page icon base on extension enable/disable state
				chrome.pageAction.setIcon({tabId: sender.tab.id, path: request.extensionEabled ? "default_icon.png" : 'default_icon_gs.png'})

				// Show the Page Action tab
				chrome.pageAction.show(sender.tab.id);
			}
            break;       
                        
       case "Extension_LoadPreferences":
            // Load and pass the extension preferences
            preferences = localStorage["basecampExtPreferences"];
			// Valid preferneces
			if (preferences)
				preferences = JSON.parse(preferences); 
            sendResponse({"preferences" : preferences});     
            break;
            
       case "Extension_SavePreferences":
            // Save the preferences
            localStorage["basecampExtPreferences"] = JSON.stringify(request.preferences);  
			
			// Ask every open basecamp tab to reload its preferneces
			ExecuteScriptInAllTabs('BasecampExt.LoadPreferences();');
            break;  		
   }
});
