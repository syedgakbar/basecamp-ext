/*   Basecamp Extension, version 0.1.0
 *   (c) 2010 Syed Ghulam akbar <akbar@jintech.com>
 *
 *   This extension assume that JQuery 1.4.2 or later is already loaded in the HTML DOM
 * 
 *   Chrome Content Page Library for the Chorme Extension. Performs the Content
 *   script specific actions
 *   http://code.google.com/chrome/extensions/
 *
 *   Modification History
 *   09/13/2010 0.2.0 - Added Support for the Time Graphs
 *   09/13/2010 0.2.1 - Added support for the new date format in the to-do lists
 *   06/03/2011 0.2.6 - Show the Next and Previous icons with date
 /*--------------------------------------------------------------------------*/
 
 // Basecamp extension handy functions
 var BasecampExt = {

	Version: '0.3.1',
	
	// This flag is set to true once the preferences are loaded
	PreferencesLoaded : false,
	
	TimeGraph :  null,
	
	// Store the default prefences
	Preferences : {
		// Store if the extension is disabled
		Disabled : false,
		
		// Preferences for the time entry
		TimeEntry : {
			
			// Default Date for the time entry
			DefaultDate : {
				Day : '--',
				Month : '--',
				Year : '--'
			},
			
			// Set the default Person
			DefaultPerson : '',
			
			// When set to true, try to parse and extract the start and end time from the 
			// description in the format of "HH:MM	HH:MM	Description"
			ParseTimeFromDescription: true,
			
			// This is the string or character, when found in the description text, everything before
			// that is removed when pasting value
			DescriptionStripString : ' - ',
			
			// When this preference is set, and user change the date manually when adding a new to-do entry
			// then that date is set as the default date
			SetLastChangeDateAsDefault : true
		},
		
		// Preferences for the time graph
		TimeGraph : {
			Enabled : true
		},
		
		// Options Page View State
		Options : {
			TimeEntryIsVisible : true,
			TimeGraphIsVisible : false
		}
	},

	// Stores the utility functions for the browser linking and binding
	Browser : {      
        // Register an event on the given Element.
        AddEventListner : (function(element, eventName, expression, bubbling)
        {
            bubbling = bubbling || false;
            
            // FireFox and other Mozilla compatible browsers
            if(window.addEventListener) 
                element.addEventListener(eventName, expression, bubbling);
            else
                element.attachEvent('on' + eventName, expression);
        }),
		
		// This funciton is similar to the WaitAsynch, but is more secure because it gets the javascript to evaluate and not a string
		// This helps avoid many script injection issues
		WaitAsynchSecure : (function(waitCheck, onSuccessCallback, param) 
		{
			var setIntervalId = window.setInterval(function() {
			
				// evaluate the result
				var loaded = false;
				try
				{
					loaded = waitCheck();
				}
				catch (exce) {};

				if(loaded) {
				  window.clearInterval(setIntervalId);
				  onSuccessCallback(param)
				}
			}, 50)
		}),
		
		// This function is used to wait until the given expression becomes valid. When so, it calls the 
		// given callback methods. It can be used to wait for the asynchornous operatoins
		WaitAsynchDeprecated : (function(waitCheck, onSuccessCallback, param) 
		{
			var setIntervalId = window.setInterval(function() {
			
				// evaluate the result
				var loaded = ( new Function( 'return ' + waitCheck ) )(); 

				if(loaded) {
				  window.clearInterval(setIntervalId);
				  onSuccessCallback(param)
				}
			}, 50)
		})
	},
	
	// Contains extension general/global functions 
	Globals : {
	
		// Returns the Active Basecamp Page
		GetActivePage : (function() {
			// Get the active tab text
			return $("#MainTabs").find('.current').text();
		})
	},
	
	// This contains handy functinos for the time entry/to-do management
	TimeEntry : { 

		// Parse the given time string, and returns the parsed time and set that values to given date string
		// Expected format is  /^(\d\d?)[:-]?(\d\d?)[:-]?(\d\d?)*$/gi
		ParseTime : (function(timeString, dateString)
		{
			var date = new Date(dateString)
			
			// Parse the given time string
			var timeformatRegExp = /^(\d\d?)[:-]?(\d\d?)[:-]?(\d\d?)*$/gi;
			timeformatRegExp.compile(timeformatRegExp); 
			var matches = timeformatRegExp.exec(timeString);
			
			// Now populate the fields
			if (matches)
			{
				if (matches.length >= 2 && matches[1]) 
					date.setHours(parseInt(matches[1], 10));
				if (matches.length >= 3 && matches[2]) 
					date.setMinutes(parseInt(matches[2], 10));
				if (matches.length >= 4 && matches[3]) 
					date.setSeconds(parseInt(matches[3], 10));
			}
			
			return date;
		}),
		
		// Parse the given date string, and returns the parsed date in the Date object
		// Expected format is  MMM dd, yyyy
		ParseDate : (function(dateString)
		{
			var date = new Date(dateString)
			
			// Parse the custom date format
			
			return date;
		}),
		
		// Given the start and end times, calculate and return the duration amount. The acceptable format for the start and end time
		// is /\d\d[:-]\d\d/
		CalcTimeDuration : (function(startTime, endTime)
		{
			// Parse the start and end times
			var dStartTime = BasecampExt.TimeEntry.ParseTime(startTime, '7/6/1981');
			var dEndtime = BasecampExt.TimeEntry.ParseTime(endTime, '7/6/1981');
			
			// Check if using 12 hours format i.e. both hours are less than 13
			if (dStartTime.getHours() < 13 && dEndtime.getHours() < 13)
			{
				// In this case, if the end time is less than start time, it may be due to 12 hours clock difference, so increment the end date hours by 12
				if (dStartTime.getHours() > dEndtime.getHours())
					dEndtime.setHours(dEndtime.getHours() + 12);
			}
			// Check for next day start in the 24 hours time, and if so, increment the day by one
			else if (dStartTime.getHours() > dEndtime.getHours())
				dEndtime.setDay(dEndtime.getDay() + 1);
				
			// Now calculate the time difference in minutes
			var differnece = (dEndtime - dStartTime) / (1000 * 60);
			var hours =  Math.floor(differnece / 60);
			var minutes = differnece % 60;
			
			// return back difference time string
			return hours + ":" + ((minutes < 10) ? "0" : "") + minutes
		}),
		
		// Parse the description field, and try to extract and populate the time from the description field 
		ParseTimeAndDescription : (function(evt, timeEntryForm)
		{
			// Check if need to parse the date/time from the description string
			if (BasecampExt.Preferences.TimeEntry.ParseTimeFromDescription)
			{
				// stores true, when the value is actually pasted, instead of typed
				var valuePasted = false;
				var descriptionField = $(timeEntryForm["time_entry[description]"])[0];
				
				// If event is not available, it's most probalbly from the past event, so use that logic
				if (!evt)
				{
					description = descriptionField.value;
					valuePasted = true;
				}
				else
					description = evt && evt.clipboardData && evt.clipboardData.getData ? evt.clipboardData.getData('text/plain') : descriptionField.value;

				// Filter any leading or trailing spaces
				description = jQuery.trim(description);
				
				// Try to parse the start and end time from the description string. Supported format is
				// 12:14	12:50	Description Text
				// 1214		1250	Descrption Text
				// 12:14am 12:50am Description Text
				var timeRangeRegExp = /^(\d\d?[:-]?\d\d?)\s*(?:[a|p]m)?\s+(\d\d?[:-]?\d\d?)\s*(?:[a|p]m)?\s+.*$/gi;
				timeRangeRegExp.compile(timeRangeRegExp); 
				var matches = timeRangeRegExp.exec(description);
				
				// Check if the time parsing was succesful
				if (matches && matches.length == 3)
				{
					// Get start and end time, and try to calculate the difference i.e. total amount of worked time
					var startTime = matches[1];
					var endTime = matches[2];
					
					// Calculate time difference, add store it in the time field
					var timeDuration = BasecampExt.TimeEntry.CalcTimeDuration(startTime, endTime)
					$(timeEntryForm["time_entry[hours]"]).val(timeDuration);
										
					// Also remove these from the description string
					description = jQuery.trim(description.replace(startTime, '').replace(endTime, ''));
					
					// Remove any am/pm time strings
					description = jQuery.trim(description.replace(/^\s*([a|p]m)?\s*([a|p]m)?/gi, ""));
				}
				
				// If value is pasted, and contains the strip string/character, clean up
				if (valuePasted && description.indexOf(BasecampExt.Preferences.TimeEntry.DescriptionStripString) > 0 )
				{
					// Remove all the string before and including stip prefix 
					description = jQuery.trim(description.substring(description.indexOf(BasecampExt.Preferences.TimeEntry.DescriptionStripString)+BasecampExt.Preferences.TimeEntry.DescriptionStripString.length));
				}
				
				// Update the field value
				descriptionField.value =  description
			}
		}),
		
		// This function is used to increment or decrement the the given entry form
		// Pass the action parameter string of the action to perform i.e. "next", "previous"
		ChangeDate : (function(formId, action)
		{
		    // Get the form object for this time entry control
			var timeEntryForm = $(formId)[0];
			
			// Get the currently selected date 
			var dateString = $(timeEntryForm["time_entry_date_display"]).val();
			var dateObject = BasecampExt.TimeEntry.ParseDate(dateString);
			
			// Change the date depending of the pass action
			if (action == "next")
			    dateObject.setDate(dateObject.getDate()+1);
			else if (action == "previous")
			    dateObject.setDate(dateObject.getDate()-1);
			    
			// Setup this as default date
            BasecampExt.Preferences.TimeEntry.DefaultDate.Day = dateObject.getDate(); 
            BasecampExt.Preferences.TimeEntry.DefaultDate.Month = dateObject.getMonth()+1; 
            BasecampExt.Preferences.TimeEntry.DefaultDate.Year = dateObject.getFullYear(); 
            BasecampExt.SavePreferences();
            
            // Simulate the form loading again to bind the new events
            BasecampExt.TimeEntry.TimeEntryLoaded(formId, true)
		}),
		
		// This function is called when a time entry editor is loaded. This function performs the misc. functions (like
		// setting up default date, setting content from clipboard, etc) based on the preferences
		TimeEntryLoaded : (function(formId, refreshOnly)
		{
			// Get the form object for this time entry control
			var timeEntryForm = $(formId)[0];
			
			// Prefernces are available for the Time Entry
			if (BasecampExt.Preferences.TimeEntry)
			{
				var MonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

				// Setup the next and previous icons for the dates
				if (!refreshOnly)
			    {
				    var baseUrl = chrome.extension.getURL("");
				    $(timeEntryForm).find(".date_pop_wrapper").parent().append("<div id='be_time_changer' style='margin: -24px 0px 10px 170px;width:12px;height:14px'><div id='be_prev_date' title='Previous Day' style='float:left;width:12px;cursor:pointer'><img src='"+baseUrl+"images/date_prev.gif' /></div><div id='be_next_date' title='Next Day' style='float:left;width:12px;margin-top:3px;cursor:pointer'><img src='"+baseUrl+"images/date_next.gif'></div></div>");
    				
				    // Bind the date change events
				    $(timeEntryForm).find("#be_prev_date").click(function() {BasecampExt.TimeEntry.ChangeDate(formId, "previous"); });
				    $(timeEntryForm).find("#be_next_date").click(function() {BasecampExt.TimeEntry.ChangeDate(formId, "next"); });
				}
				
				// Select the default date if specified in the prefernces
				var datePref = BasecampExt.Preferences.TimeEntry.DefaultDate
				if (datePref)
				{
					// Get the currently selected date 
					var dateString = $(timeEntryForm["time_entry_date_display"]).val();
					var dateObject = BasecampExt.TimeEntry.ParseDate(dateString);

					if (datePref.Year != '--')
						dateObject.setYear(datePref.Year);	
					if (datePref.Month != '--')
						dateObject.setMonth(datePref.Month-1);						
					if (datePref.Day != '--')
						dateObject.setDate(datePref.Day);

					// Set this date as the active date
					$(timeEntryForm["time_entry[date]"]).val(dateObject.getFullYear() + '-' + (dateObject.getMonth() + 1) + '-' + dateObject.getDate());
					dateString = MonthNames[dateObject.getMonth()] + " " + dateObject.getDate() + ", " + dateObject.getFullYear();
					$(timeEntryForm["time_entry_date_display"]).val(dateString);
				}
				
				// Check if need to set the default date based on the last date
				if (BasecampExt.Preferences.TimeEntry.SetLastChangeDateAsDefault && !refreshOnly)
				{
				    $(formId).click(function() 
					{
						// Check if need to set the last changed date as the default date
						if (BasecampExt.Preferences.TimeEntry.SetLastChangeDateAsDefault) 
						{
							// Get the new date value
							var dateString = $(timeEntryForm["time_entry_date_display"]).val();
							var dateObject = BasecampExt.TimeEntry.ParseDate(dateString);	
							
							// Store this as default date
							if (dateObject && dateObject.getDate())
							{
								BasecampExt.Preferences.TimeEntry.DefaultDate.Day = dateObject.getDate(); 
								BasecampExt.Preferences.TimeEntry.DefaultDate.Month = dateObject.getMonth()+1; 
								BasecampExt.Preferences.TimeEntry.DefaultDate.Year = dateObject.getFullYear(); 
								
								// Save the preferences
								BasecampExt.SavePreferences();
							}
						} 
					});
				}
				
				// Check if default person is set
				var defaultPerson = BasecampExt.Preferences.TimeEntry.DefaultPerson;
				if (defaultPerson && defaultPerson.length > 0)
				{
					// Set this as the default person for time entry
					$(timeEntryForm["time_entry[person_id]"]).find('option').each(function() { this.selected = (jQuery.trim(this.text) == defaultPerson); });
				}
				
				// if preference is set to auto parse time from description
				if (BasecampExt.Preferences.TimeEntry.ParseTimeFromDescription)
				{
					// set the focus to that field and enable event for paste tracking
					if ($(timeEntryForm["time_entry[description]"])[0])
						window.setTimeout(function() {$(timeEntryForm["time_entry[description]"])[0].focus()}, 100);
					
					// Bind the events to track the description field change i.e. focus out or content paste
					$(timeEntryForm["time_entry[description]"]).blur(function(evt) {BasecampExt.TimeEntry.ParseTimeAndDescription(evt, timeEntryForm) });
					$(timeEntryForm["time_entry[description]"]).bind('paste', function() { window.setTimeout(function() {BasecampExt.TimeEntry.ParseTimeAndDescription(null, timeEntryForm )}, 50); });
				}
			}
			
		}),
		
		// Initialize the Time Entry control and bind the necessary events/functions
		Initialize : (function()
		{
			// Get the current active page
			activePage = BasecampExt.Globals.GetActivePage();
			
			// Current page is To-Dos
			if (activePage == 'To-Dos')
			{
				// Bind the document click handler to trap the time entry related functions
				$(document).click(function(evt)
				{
					// Only process, if the extension is enabled
					if (!BasecampExt.Preferences.Disabled)
					{
						var timeControlRegExp = /^item_(\d+)_time_tracking_control$/gi;
						timeControlRegExp.compile(timeControlRegExp); 
						
						// Check if clicked on the time entry anchor control
						if (evt.target && evt.target.parentNode && timeControlRegExp.test(evt.target.parentNode.id))
						{
							// Parse the ID of the time entry control, we need to recompile otherwise some time the next 
							// regexp command fails (strange, but this is how it's working in chrome)
							timeControlRegExp.compile(timeControlRegExp);
							var matches = timeControlRegExp.exec(evt.target.parentNode.id);
							timeEntryId = matches[1];
							
							// Check if form control is already visible, if so, don't call the loaded function
							if (!$("#item_"+timeEntryId+"_content form")[0])
								BasecampExt.Browser.WaitAsynchDeprecated('$("#item_"+timeEntryId+"_content form")[0]', BasecampExt.TimeEntry.TimeEntryLoaded, "#item_"+timeEntryId+"_content form");
						}
					}
				})
			}
			// Current page is time tracking one
			else if (activePage == 'Time')
			{
				// First bind the main time entry controls (right after the page load)
				BasecampExt.Browser.WaitAsynchDeprecated('$("#entry_adder")[0]', BasecampExt.TimeEntry.TimeEntryLoaded, '#entry_adder');
				
				// Bind another event handle on submit button to reset it after the first entry
				$('#entry_adder :submit').click(function(evt)
				{
					BasecampExt.Browser.WaitAsynchDeprecated('$("#entry_adder :submit").val() != "Adding to log"', BasecampExt.TimeEntry.TimeEntryLoaded, '#entry_adder');
				});
			}
		})	
	},
	
	// Save the Basecamp Extension preferences in the database
	SavePreferences : (function() {
		// Save the preferences to the database
		chrome.extension.sendRequest({message: "Extension_SavePreferences", preferences: BasecampExt.Preferences});
	}),
	
	// Load the Basecamp Extension preferences from the database
	LoadPreferences : (function() {
	
		chrome.extension.sendRequest({message: "Extension_LoadPreferences"}, function(result) {
			// Check if preferences object is valid
			if (result && result.preferences)
			{
				// Load the saved data to the extension preferences (part by part for future changes compatability)
				BasecampExt.Preferences.Disabled = result.preferences.Disabled;
				
				// Time Entry preferneces load
				BasecampExt.Preferences.TimeEntry.DefaultDate = result.preferences.TimeEntry.DefaultDate;
				BasecampExt.Preferences.TimeEntry.DefaultPerson = result.preferences.TimeEntry.DefaultPerson;
				BasecampExt.Preferences.TimeEntry.ParseTimeFromDescription = result.preferences.TimeEntry.ParseTimeFromDescription;
				BasecampExt.Preferences.TimeEntry.DescriptionStripString = result.preferences.TimeEntry.DescriptionStripString;
				if (result.preferences.TimeEntry.SetLastChangeDateAsDefault != null)
				    BasecampExt.Preferences.TimeEntry.SetLastChangeDateAsDefault = result.preferences.TimeEntry.SetLastChangeDateAsDefault;
				    
				// Time graph preferneces are available
				if (result.preferences.TimeGraph)
					BasecampExt.Preferences.TimeGraph = result.preferences.TimeGraph;
				
				// Display options are available
				if (result.preferences.Options)
					BasecampExt.Preferences.Options = result.preferences.Options;
			}
			
			BasecampExt.PreferencesLoaded = true;
			
			// Set the page icon based on the enable state
			chrome.extension.sendRequest({message: "ShowPageAction", extensionEabled : !BasecampExt.Preferences.Disabled});	 
			
			// If time graph module is loaded, refresh it as well
			if (BasecampExt.TimeGraph)
				BasecampExt.TimeGraph.ApplyPreferences();
		});
	}),
		
	// Initialize all the prototype functions
	Initialize : (function()
	{
		// Initialize  the events
		this.TimeEntry.Initialize();
		
		// Initialize the Time Graph
		BasecampExt.Browser.WaitAsynchSecure( function() {return BasecampExt.TimeGraph}, function() { BasecampExt.TimeGraph.Initialize(); });
		
		// Load the preferences
		this.LoadPreferences();
	})
}

// Initialize the Extension
BasecampExt.Initialize();