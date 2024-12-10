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
 /*--------------------------------------------------------------------------*/
 
 // Enable or disable all the options controls on the Options page based on the current flag.
 // Note: this function assume that all such HTML control (to disable) have a CSS class set to 'BceOption'
 function enableOptions(enable)
 {
	$(".BceOption").attr("disabled", enable ? '' : "disabled");
 }
 
 // Populate the last 5 years in the select control
 function populateLastFiveYears(drpControl)
 {
	var currentDate = new Date();
	
	// Get the fifth last year (from current year)
	var startYear = currentDate.getFullYear() - 4;
	
	for (i=0; i<5; i++)
		drpControl.options[drpControl.length] = new Option(startYear+i, startYear+i);
 }
 
 // Save the current preferences to the database
 function SavePreferences(section)
 {
	// Save Time Entry section
	if (section=='TimeEntry')
	{
		BasecampExt.Preferences.Disabled = !$('#chExtEnabled')[0].checked;
		BasecampExt.Preferences.TimeEntry.DefaultPerson = $('#txtDefaultPerson').val();
		BasecampExt.Preferences.TimeEntry.DescriptionStripString = $('#txtDescriptionPrefix').val();
		BasecampExt.Preferences.TimeEntry.ParseTimeFromDescription = $('#chkParseTimeFromDesc')[0].checked;
		BasecampExt.Preferences.TimeEntry.SetLastChangeDateAsDefault = $('#chkSetLastDateAsDefault')[0].checked;
		
		// Save the deefault time entry info
		BasecampExt.Preferences.TimeEntry.DefaultDate.Day = $('#drpDefaultDateDay').val();
		BasecampExt.Preferences.TimeEntry.DefaultDate.Month = $('#drpDefaultDateMonth').val();
		BasecampExt.Preferences.TimeEntry.DefaultDate.Year = $('#drpDefaultDateYear').val();
	}
	
	// Save Time Graph section
	if (section=='TimeGraph')
	{
		BasecampExt.Preferences.TimeGraph.Enabled = $('#chkShowCreateGraphLink')[0].checked;
	}
	
	// Check and Save Options page display state
	if (section=='OptionsViewState')
	{
		BasecampExt.Preferences.Options.TimeEntryIsVisible = $('#divTimeEntryOptions').is(':visible');
		BasecampExt.Preferences.Options.TimeGraphIsVisible = $('#divTimeGraphOptions').is(':visible');
	}
	
	BasecampExt.SavePreferences();
 }
 
 // Load the preferences defaults from the stored preferences. This function waits until the saved
 // preferences are loaded from the localStorage before popuplating the fields
 function PopulatePreferences()
 {
	BasecampExt.Browser.WaitAsynchSecure( function() { return (BasecampExt && BasecampExt.PreferencesLoaded) }, function() {
		// Load the enable flag status
		$('#chExtEnabled')[0].checked = !BasecampExt.Preferences.Disabled;
		
		// Load the default user info
		$('#txtDefaultPerson').val(BasecampExt.Preferences.TimeEntry.DefaultPerson);
		
		// Load the description pre-fix string
		$('#txtDescriptionPrefix').val(BasecampExt.Preferences.TimeEntry.DescriptionStripString);
		
		// Load the parsing flag status
		$('#chkParseTimeFromDesc')[0].checked = BasecampExt.Preferences.TimeEntry.ParseTimeFromDescription;
		
		// Load the last change as default date flag
		$('#chkSetLastDateAsDefault')[0].checked = BasecampExt.Preferences.TimeEntry.SetLastChangeDateAsDefault;
		
		// Populate last 5 years data into the year control
		populateLastFiveYears($('#drpDefaultDateYear')[0]);
		
		// Now set the default date from preferences
		$('#drpDefaultDateDay').val(BasecampExt.Preferences.TimeEntry.DefaultDate.Day)
		$('#drpDefaultDateMonth').val(BasecampExt.Preferences.TimeEntry.DefaultDate.Month)
		$('#drpDefaultDateYear').val(BasecampExt.Preferences.TimeEntry.DefaultDate.Year)
		
		// Load time graph enable state
		$('#chkShowCreateGraphLink')[0].checked = BasecampExt.Preferences.TimeGraph.Enabled;
		
		// Enable the control based on preferences
		enableOptions(!BasecampExt.Preferences.Disabled);
		
		// Restore the state of the options sections visibility
		BasecampExt.Preferences.Options.TimeEntryIsVisible ? $('#divTimeEntryOptions').show() : $('#divTimeEntryOptions').hide();
		BasecampExt.Preferences.Options.TimeGraphIsVisible ? $('#divTimeGraphOptions').show() : $('#divTimeGraphOptions').hide();
	});
 }
 
jQuery(document).ready(function(){
	$('#options_wrapper .section_header').click( function() {
		var nextControl = $(this).next()
		if (nextControl.is(':visible'))
			nextControl.slideUp(400, function() {SavePreferences('OptionsViewState');});
		else
			nextControl.slideDown(200, function() {SavePreferences('OptionsViewState');});
	});
	
	// Populate the preferences controls
	PopulatePreferences();
	
	// Bind the event hanlders
	$('#chExtEnabled').bind('click', function () {enableOptions(this.checked);SavePreferences('TimeEntry')});
	
	$('#drpDefaultDateMonth').bind('change', function () {SavePreferences('TimeEntry')});
	$('#drpDefaultDateDay').bind('change', function () {SavePreferences('TimeEntry')});
	$('#drpDefaultDateYear').bind('change', function () {SavePreferences('TimeEntry')});
	
	$('#txtDefaultPerson').bind('change', function () {SavePreferences('TimeEntry')});
	$('#txtDescriptionPrefix').bind('change', function () {SavePreferences('TimeEntry')});
	
	$('#chkParseTimeFromDesc').bind('click', function () {SavePreferences('TimeEntry')});
	$('#chkSetLastDateAsDefault').bind('click', function () {SavePreferences('TimeEntry')});
	
	$('#chkShowCreateGraphLink').bind('click', function () {SavePreferences('TimeGraph')});
	
});