/*   Basecamp Extension, version 0.1.0
 *   (c) 2010 Syed Ghulam akbar <akbar@jintech.com>
 *
 *   This library contains the functions to extract and draw the graphs from the time entries data
 *   Note: This library assume that BasecampExt core library is already loaded
 * 
 *   Modification History
 *   03/13/2017 - Show the graph using new http://www.chartjs.org library
 /*--------------------------------------------------------------------------*/
 
  // Basecamp extension time graph functions
TimeGraph = {

	// This class contains the utility functions to build the Graph XML
	Graph : {
		
		BackgrundColor : "EDF3FE",
		Caption : "",
		SubCaption : "",
		XAxixTitle : "",
		YAxixTitle : "Hours",
		ShowaAimation : true,
		Data : new Array(),
		Colors :  ["336699", "FF8000", "FFFF00", "80FF00","FF0080", "FF3D3D", "FF7A7A", "00FF00","FF00FF", "7AFFFF", "00FF80", "8000FF","0000FF", "0080FF", "FF6600", "FFE600", "CCCC00", "FF47FF", "B85C00", "33FF33", "660000"],
		
		// Get the Graph XML for the given data and graph parameters	
		// grapType - Type of graph to use i.e. Lines, Bar, Pie, Area, etc.
		// Check the following link for the XML Format of graph:
		// http://www.fusioncharts.com/free/docs/
		GenerateGraphXml : function(graphType)
		{		
			graphInfo = TimeGraph.Graph;
				
			// built a unique list of categories and set from the data
			var categories = new Array();
			var dataset = new Array();
			for (i=0; i < graphInfo.Data.length; i++)
			{
				for (j=0; j<categories.length; j++)
					// this category already exist in the cateogry list
					if (graphInfo.Data[i].Category == categories[j])
						break;
				
				// As this category is not in the cateogries list, so add it
				if (j == categories.length)
					categories.push(graphInfo.Data[i].Category);
					
				for (j=0; j<dataset.length; j++)
					// this set already exist in the dataset list
					if (graphInfo.Data[i].Set == dataset[j])
						break;
				
				// As this set is not in the data-set list, so add it
				if (j == dataset.length)
					dataset.push(graphInfo.Data[i].Set);					
			}
			
			graphXml = '<graph showNames="1" ';
			
			// Set the graph level properties/info
			if (graphInfo.BackgrundColor)
				graphXml += ' bgcolor="'+graphInfo.BackgrundColor+'" ';
			if (graphInfo.Caption)
				graphXml += ' caption="'+graphInfo.Caption+'" ';
			if (graphInfo.SubCaption)
				graphXml += ' subcaption="'+ graphInfo.SubCaption +'" ';
			if (graphInfo.XAxixTitle)
				graphXml += ' xAxisName="'+graphInfo.XAxixTitle+'" ';
			if (graphInfo.YAxixTitle)
				graphXml += ' yAxisName="'+graphInfo.YAxixTitle+'" ';
			
			// If there are more than 12 items in the sets/category, rotate the name to avoid overwrite
			if (graphInfo.Data.length > 12 && categories.length == 1)
				graphXml += ' rotateNames="1"  ';
				
			// Close the Graph tag
			graphXml +=  ' > \n';
			
			// If more than one categories exists, add them in the graph XML
			if (categories[0] != "Simple")
			{			
				graphXml +=  '<categories font="Arial" fontSize="11" fontColor="000000"> \n'
				for (i=0; i < categories.length; i++)
				{
					categoryName = hoverText = categories[i].replace(/["|']/gi, "");
					
					// check for set name maximum limit
					if (categoryName.length > 20)
						categoryName = categoryName.substring(0, 20) + "...";
						
					graphXml +=  '<category name="' + categoryName + '" hoverText="'+ hoverText +'"  /> \n'
				}
				graphXml +=  '</categories> \n'
				
				// Now print multi-series chart set data
				for (i=0; i < dataset.length; i++)
				{
					graphXml +=  '<dataset seriesname="'+ dataset[i] +'" color="' + graphInfo.Colors[i % (graphInfo.Colors.length - 1)] + '" alpha="100"> \n'
					
					// Check for all categories
					for (j=0; j< categories.length; j++)
					{
						bMatchFound = false;
						
						// Print this series and data-set only data
						for (k=0; k < graphInfo.Data.length; k++)
						{
							// If this is the current seris data
							if (categories[j] == graphInfo.Data[k].Category && dataset[i] == graphInfo.Data[k].Set)
							{
								graphXml +=  '<set value="'+parseFloat(graphInfo.Data[k].Value).toFixed(2)+'" /> \n';
								bMatchFound = true;
								break;
							}
						}
						
						// If the mathc is not found, show an empty value so that category/set pairs are in order
						if (!bMatchFound)
							graphXml +=  '<set value="0" /> \n';
					}
				
					graphXml +=  '</dataset> \n'
				}
			}
			else
			{
				// Create the set for single series chart
				for (i=0; i < graphInfo.Data.length; i++)
				{
					// Remove any dangrous characters from the source string
					hoverText = graphInfo.Data[i].Set.replace(/["|']/gi, "");
					setName = hoverText;
					
					// check for set name maximum limit
					if (setName.length > 20)
						setName = setName.substring(0, 20) + "...";
						
					graphXml +=  '<set name="'+ setName +'" hoverText="'+ hoverText +'" value="'+parseFloat(graphInfo.Data[i].Value).toFixed(2)+'" color="' + ((graphType == 'Line 2D Chart') ? graphInfo.Colors[0] : graphInfo.Colors[i % (graphInfo.Colors.length - 1)]) + '" /> \n';
				}
			}
			
			graphXml +=  '</graph> \n';
			
			return graphXml;
		},
		
		getGraphJSONData : function(graphType) {
			graphInfo = TimeGraph.Graph;
						
			// Graph JSON Data
			jsonData = {
				labels: [],
				datasets: [{
					data: [],
					backgroundColor: [],
					borderWidth: 1
				}]
			};
				
			// built a unique list of categories and set from the data
			var categories = new Array();
			var dataset = new Array();
			for (i=0; i < graphInfo.Data.length; i++)
			{
				for (j=0; j<categories.length; j++)
					// this category already exist in the cateogry list
					if (graphInfo.Data[i].Category == categories[j])
						break;
				
				// As this category is not in the cateogries list, so add it
				if (j == categories.length)
					categories.push(graphInfo.Data[i].Category);
					
				for (j=0; j<dataset.length; j++)
					// this set already exist in the dataset list
					if (graphInfo.Data[i].Set == dataset[j])
						break;
				
				// As this set is not in the data-set list, so add it
				if (j == dataset.length)
					dataset.push(graphInfo.Data[i].Set);					
			}
			
			// If more than one categories exists, add them in the graph XML
			if (categories[0] != "Simple")
			{
			} else {
				// Create the set for single series chart
				for (i=0; i < graphInfo.Data.length; i++)
				{
					// Remove any dangrous characters from the source string
					hoverText = graphInfo.Data[i].Set.replace(/["|']/gi, "");
					setName = hoverText;
					labelColor = ((graphType == 'Line Chart') ? graphInfo.Colors[0] : graphInfo.Colors[i % (graphInfo.Colors.length - 1)]);
					
					// check for set name maximum limit
					if (setName.length > 20)
						setName = setName.substring(0, 20) + "...";
					
					jsonData.labels.push(setName);
					jsonData.datasets[0].backgroundColor.push('#'+labelColor);
					jsonData.datasets[0].data.push(parseFloat(graphInfo.Data[i].Value).toFixed(2));
					//graphXml +=  '<set name="'+ setName +'" hoverText="'+ hoverText +'" value="'+parseFloat(graphInfo.Data[i].Value).toFixed(2)+'" color="' + ((graphType == 'Line 2D Chart') ? graphInfo.Colors[0] : graphInfo.Colors[i % (graphInfo.Colors.length - 1)]) + '" /> \n';
				}
			}
			
			return jsonData;
		}
	},
	
	// Contains the wrapper functions for the extracting and processing of the Report Data
	ReportData : {
		
		// Stores the collection of report data rows
		Data : null, 
		
		// Round the given number the required decimal places. Default decimlar places is "2"
		Round : (function(number, decimal)
		{
			decimal = (!decimal ? 2 : decimal);
			return Math.round(number*Math.pow(10,decimal))/Math.pow(10,decimal);
		}),
		
		// Get the Week number of the give date month
		GetWeekOfMonth : (function(date) 
		{
			// Get the day number of the given date
			var dayOfMonth = date.getDate() - 1;
			
			// Now calculate the first day of that month
			var first = new Date(date.getFullYear() + '/' + (date.getMonth() + 1) + '/01');
			var monthFirstDateDay = first.getDay();
			
			// Calculate the week from these two day numbers (divide by 7 to get week)
			return Math.ceil((dayOfMonth + monthFirstDateDay) / 7);
		}),
		
		// Get the next date of the month for the given date. NextDay shuould be passed 1 for next Monday, 2 for Tuesday, and so on
		NextDayOfMonth : (function(date, nextDay) 
		{
			month = date.getMonth();
			
			// Keep adding days until reach the required day or it's start of next month
			while (month == date.getMonth() && date.getDay() != nextDay )
			{
				date.setDate(date.getDate() + 1)
			}
			
			// If month changed, revert to last date
			if (month != date.getMonth())
				date.setDate(date.getDate() - 1)
				
			return date;
		}),
		
		// Get the Series Name (display friend) for the charting for the given date
		GetSeriesNameFromDate : (function(gropName, date) 
		{
			seriesName = "";
			months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
			numSuffx = ["st", "nd", "rd", "th", "th", "th"]
			
			// Check the group name by which to create the series name from date
			switch  (gropName)
			{
				case "Day" :
					seriesName = date.getDate() + " " + months[date.getMonth()];
					break;
					
				case "Week":
					// Get the first monday of the given date
					//nextMondayDate = TimeGraph.ReportData.NextDayOfMonth(date, 1);
					//seriesName = TimeGraph.ReportData.GetSeriesNameFromDate("Day", nextMondayDate);
					weekOfMonth = TimeGraph.ReportData.GetWeekOfMonth(date)
					seriesName = weekOfMonth + numSuffx[weekOfMonth-1] + " week of " + months[date.getMonth()];
					break;
				
				case "Month" :
					seriesName = months[date.getMonth()] + " " + date.getFullYear();
					break;		

				case "Quarter" :
					month = date.getMonth();
					
					if (month <= 3)
						seriesName = "Jan-Mar " + date.getFullYear();
					else if (month <= 6)
						seriesName = "Apr-Jun" + date.getFullYear();
					else if (month <= 9)
						seriesName = "Jul-Sep" + date.getFullYear();
					else
						seriesName = "Oct-Nov" + date.getFullYear();
					break;	
					
				case "Year" :
					seriesName = date.getFullYear() + " ";
					break;					
			}
			
			return seriesName;
		}),
		
		// This function summarize the time log data to the format which can be used for the graph generation.
		// It groups the data into series and sets, and return the summarized data.
		// summaryType - Type of graph summary to generate. When passed 'Summary', generate an agreegrate single serires graph
		// groupBy - Type by which to group the data i.e. Person, Project, Time, etc.
		// dateGroup - Date Group to use in the case graph is by date
		SummarizeDataForGraph : (function(summaryType, groupBy)
		{
			var data = TimeGraph.ReportData.Data;
			var graphData = new Array();
			
			// First sort the given data by Date, so that we can pick the maximum and minimum dates
			data.sort( function(a, b) { 
				return (a.Date < b.Date) ? -1 : 1 
			});
			
			// Get the difference in days between the first and last date (of current data)
			var oneDay=1000*60*60*24;	//Set 1 day in milliseconds
			differenceDays = Math.ceil((data[data.length - 1].Date.getTime()-data[0].Date.getTime())/(oneDay));
			
			// Get the date level grouping/summary level depending on the difference of days
			var timeGroup = "Day"
			
			// Check the summary type
			if (summaryType == 'Simple')
			{
				// As for the simple summary chart, we display single series, so we can show more columns
				if (differenceDays < 15)
					timeGroup = "Day"
				else if (differenceDays < 90)
					timeGroup = "Week"
				else if (differenceDays < 360)
					timeGroup = "Month"
				else if (differenceDays < 1000)
					timeGroup = "Quarter"
				else
					timeGroup = "Year"
			}
			else
			{
				// As for the other groups, we have to show multi-series chart, so we have compartively limited space, thsu 
				// use lower difference days check
				if (differenceDays < 7)
					timeGroup = "Day"
				else if (differenceDays < 30)
					timeGroup = "Week"
				else if (differenceDays < 180 )
					timeGroup = "Month"
				else if (differenceDays < 1000)
					timeGroup = "Quarter"
				else
					timeGroup = "Year"
			}
			
			// Check for custom date settings
			if (summaryType == "Group by date" && $("#bceSummaryDateOptions").val() != "Auto")
				timeGroup =  $("#bceSummaryDateOptions").val() ;
			
			if (groupBy == "Date" && $("#bceSeriesDateOptions").val() != "Auto")
				timeGroup =  $("#bceSeriesDateOptions").val() ;
				
			// Loop through all the rows in the data, and process and group the rows
			for (i=0; i<data.length; i++)
			{
				// build the category name depending on summary type
				switch (summaryType)
				{
					case 'Simple':
						category = 'Simple'
						break;
					
					case 'Group by client':
						category = data[i].Client;
						break;
						
					case 'Group by project':
						category = data[i].Project;
						break;
						
					case 'Group by person' : 
						category = data[i].Person;
						break;
						
					case 'Group by date':
						category = TimeGraph.ReportData.GetSeriesNameFromDate(timeGroup, data[i].Date);
						break;
				}
				
				// Check the set to tuse
				switch (groupBy)
				{
					case 'Client':
						set = data[i].Client;
						break;
						
					case 'Project':
						set = data[i].Project;
						break;
						
					case 'Person' : 
						set = data[i].Person;
						break;
					
					case 'ToDo' : 
						set = data[i].ToDo;
						break;
						
					case 'Date' : 
						set = TimeGraph.ReportData.GetSeriesNameFromDate(timeGroup, data[i].Date);;
						break;
				}
					
				// Get the hours
				value = parseFloat(data[i].Hours);
				
				// Create the new data row
				graphRow = {Category : category, Set : set, Value : value};
				
				// Now insert this row in the 
				if (graphData.length > 0)
				{
					bRowUpdated = false;
					
					// Now loop through all the existing rows ans search for matching category and set row
					for (iCounter=0; iCounter < graphData.length; iCounter++)
					{
						// Check if this row category and set is same as of new row
						if (graphData[iCounter].Category == graphRow.Category && graphData[iCounter].Set == graphRow.Set)
						{
							graphData[iCounter].Value +=  parseFloat(graphRow.Value);	// Increment the existing value
							
							// Set the flag to indicate that we row is already added to an existing row
							bRowUpdated = true;
							
							break;	// Force break the loop
						}	
					}
					
					// If an existing row is not updated, insert a new one
					if (!bRowUpdated)
						graphData.push(graphRow);
				}
				else
					graphData.push(graphRow);
			}
			
			return graphData;
		}),
		
		// Parse the curren page and Load the data into TimeGraph.ReportData.Data object
		ExtractData : (function()
		{
			var project = "";
			var client = "";
			
			// Reset the Data Array
			TimeGraph.ReportData.Data = new Array();
			
			// Populate the main Project and Client (for the project page)
			projectInfo = $('h1').html().split('<span>');
			project = jQuery.trim(projectInfo[0]);
			if (projectInfo.lenght > 1)
				client = jQuery.trim(projectInfo[1].replace('</span>', ''));
		
			// Process all the rows under the "entries" table
			$('#entries tr').each(function(index, object) {
				
				// Check if blank row or new time entry row
				if ($(this).is('.blank_row_for_safari') ||  $(this).is('#new_time_entry'))
					return;
				
				// Check if it's a project start row
				if ($(this).find('.project')[0])
				{
					// Parse the Project and Client name from the content string (seperated by "-")
					projectInfo = $(this).find('.project').text().split( String.fromCharCode(8212) );
					client = jQuery.trim(projectInfo[0]);
					project = jQuery.trim(projectInfo[1]);
					
					// Continue to the next row
					return;
				}
				
				// As this might be the data row, so parse and extract the info
				date =  jQuery.trim( $(this).find('.date').text() );
				person = jQuery.trim( $(this).find('.person').text() );
				hours =  jQuery.trim( $(this).find('.hours').text() );
				toDo =  jQuery.trim( $(this).find('.desc a').text() );
				
				// Only go ahead and add this row if it contains a valid date. Valid formats are \
				// MMM dd
				// MMM dd yyyy
				var dateFormatRegExp = /^(\w{3}\s\d\d)\s?(\d\d)?$/gi;
				dateFormatRegExp.compile(dateFormatRegExp);
				
				if (dateFormatRegExp.test(date))
				{
					// First convert the date into starndar date format which can be parsed by JavaScript Date object i.e. MMM dd, yyyyy
					dateFormatRegExp.compile(dateFormatRegExp);
					var matches = dateFormatRegExp.exec(date);
					
					// Check if year is part of the date string
					if (matches.length >= 3 && matches[2])
						date = matches[1] + ", " + "20" + matches[2]
					else
						date = matches[1] + ", " + (new Date()).getFullYear();
						
					// Build the new data row and insert it into main data collection
					dataRow = {Client : client, Project: project, Date : new Date(date), Person : person, ToDo : toDo, Hours : hours}
					TimeGraph.ReportData.Data.push(dataRow);
				}
			})
		})
	
	},
	
	// Toggle (hide/show) the display of the Graph options in the page header
	ToggleOptions : (function() 
	{
		// Toggle the visible state
		if ($('#new_graph_option').is(':visible'))
		{
			$('#new_graph_option').slideUp();
			setTimeout(function() {$('#original_header')[0].style.display = ''}, 300)
		}
		else
		{
			// Hide the existing graph (if any)
			$("#bceGraphDivWrapper").hide();
			
			$('#original_header')[0].style.display = 'none'
			$('#new_graph_option').slideDown();
		}
	}),
	
	// Extract the current report data, and generate graph
	GenerateGraph : (function() 
	{
		// Populate the graph data from the current page contents
		TimeGraph.ReportData.ExtractData();
		
		// Now summarize the data for the graph source
		summaryType = $("#bceGraphSummary").val();
		groupBy = $("#bceGraphSeries").val();
		graphData = TimeGraph.ReportData.SummarizeDataForGraph(summaryType, groupBy);
		
		// Now generate the Graph XML
		TimeGraph.Graph.Caption = jQuery.trim($("#reporttitle").text());
		TimeGraph.Graph.Data = graphData;
		var graphType = $("#bceGraphType").val();
				
		// Show/Hide the controls
		$("#bceGraphDivWrapper").show();
		BasecampExt.TimeGraph.ToggleOptions();
	
		// Remove previous graph
		$("#bceGraphDiv").remove();
		$("#bceGraphDivWrapper").append('<canvas id="bceGraphDiv" style="width:100%;height:500px;"></canvas>');
		
		grapType = "bar";
		graphOptions = {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero:true
					}
				}]
			},
			title: {
				display: true,
				text: TimeGraph.Graph.Caption
			},
			legend: {
				display: false
			}
		}
		
		switch (graphType)
		{
			case 'Column Chart':
				grapType = 'bar';
				break;
			case 'Pie Chart':
				grapType = 'pie';
				graphOptions = null;
				break;
			case 'Line Chart':
				grapType = 'line';
				break;
			case 'Doughnut Chart':
				grapType = 'doughnut';
				graphOptions = null;
				break;			
		}
		
		// Render the new graph
		var ctx = document.getElementById("bceGraphDiv");
		var myBarChart = new Chart(ctx, {
			type: grapType,
			responsive : false,
			maintainAspectRatio : false,
			data: TimeGraph.Graph.getGraphJSONData(graphType),
			options: graphOptions
		});
		
		return;
		
		strXML = TimeGraph.Graph.GenerateGraphXml( $("#bceGraphType").val() ) ;
				
		// Get the graph flash file depending on the selected graph

		var graphFile = "FCF_Column3D.swf";
		
		// Check if need simple or multi-series graph
		if (summaryType == "Simple")
		{
			switch (graphType)
			{
				case 'Column 2D Chart':
					graphFile = 'FCF_Column2D.swf';
					break;
				case 'Column 3D Chart':
					graphFile = 'FCF_Column3D.swf';
					break;
				case 'Pie 2D Chart':
					graphFile = 'FCF_Pie2D.swf';
					break;
				case 'Pie 3D Chart':
					graphFile = 'FCF_Pie3D.swf';
					break;
				case 'Line 2D Chart':
					graphFile = 'FCF_Line.swf';
					break;
				case 'Bar 2D Chart':
					graphFile = 'FCF_Bar2D.swf';
					break;
				case 'Area 2D Chart':
					graphFile = 'FCF_Area2D.swf';
					break;
				case 'Doughnut 2D Chart':
					graphFile = 'FCF_Doughnut2D.swf';
					break;			
			}
		}
		else
		{
			// Build multi-series graph/chart list
			switch (graphType)
			{
				case 'Column 2D Chart':
					graphFile = 'FCF_MSColumn2D.swf';
					break;
				case 'Column 3D Chart':
					graphFile = 'FCF_MSColumn3D.swf';
					break;
				case 'Line 2D Chart':
					graphFile = 'FCF_MSLine.swf';
					break;
				case 'Bar 2D Chart':
					graphFile = 'FCF_MSBar2D.swf';
					break;
				case 'Area 2D Chart':
					graphFile = 'FCF_MSArea2D.swf';
					break;		
			}
		}
		
		// Render the Graph
		//graphUrl = 'http://www.fusioncharts.com/free/gallery/charts/' + graphFile
		graphUrl = chrome.extension.getURL ("FusionCharts/" + graphFile);
		graphWidth = $("#bceGraphDiv").width();
		graphHeight = (graphData.length < 12 && summaryType == 'Simple')  ? 350 : 500;
		
		// So far only the Windows Chrome seems to load the local flash/swf files correctly
		// For all others, we need to use the iFrame to load the local swf file
		if (!(window.navigator.userAgent && window.navigator.userAgent.indexOf("(Windows") > 0) && false)
		{
			// Build the graph URL
			graphUrl += "?chartWidth="+graphWidth+"&chartHeight="+graphHeight+"&debugMode=0&DOMId=bceTimeChart&registerWithJS=0&scaleMode=noScale&lang=EN";
			
			// Handle special unicode characters
			strXML = strXML.replace('\u2019', "")
			
			// Append the data
			graphUrl += '&dataXML='+escape(strXML);
			
			iFrameHtml = "<iframe src='"+graphUrl+"' style='border:none; width:100%; height:"+graphHeight+"px'>"
			$('#bceGraphDiv').html(iFrameHtml);
		}
		else
		{
			var bceGraph = new FusionCharts(graphUrl , "bceTimeChart", graphWidth, graphHeight, "0", "0");	
			bceGraph.setDataXML(strXML);
			bceGraph.render("bceGraphDiv");	
		}
				
	}),
	
	// Populate the series drop down based on the Summary Type dropdown selectoin
	PopulateSeriesAndGraphType : (function() 
	{
		bceGraphSeries = $("#bceGraphSeries")[0];
	
		// Get the Summary type dropdown selection
		oldValue = bceGraphSeries.value;
		summaryType = $("#bceGraphSummary").val();
		
		// Reset the existing selection
		bceGraphSeries.options.length = 0;
		seriesOptionsArray = [];
		
		// Populate the series option depending by the summary type
		if (summaryType != "Group by client")
			seriesOptionsArray.push("Client");
		if (summaryType != "Group by project")
			seriesOptionsArray.push("Project");
		if (summaryType != "Group by person")
			seriesOptionsArray.push("Person");
		if (summaryType != "Group by date")
			seriesOptionsArray.push("Date");
		seriesOptionsArray.push("ToDo");
		
		for (i=0; i<seriesOptionsArray.length; i++)
		{
			var opt = document.createElement('option');
			opt.text = seriesOptionsArray[i];
			opt.value = seriesOptionsArray[i];		
			bceGraphSeries.add(opt, null);
			//bceGraphSeries.options[bceGraphSeries.length] = new Option(seriesOptionsArray[i]);
			
			// Mark this as selected
			if (seriesOptionsArray[i] == oldValue)
				bceGraphSeries.options[bceGraphSeries.length - 1].selected = true;
		}
		
		// Populate the Graph Type drop down
		bceGraphType = $("#bceGraphType")[0];
		oldValue = bceGraphType.value;
		bceGraphType.options.length = 0;
		
		// Populate the graph type depending on the summary and series selection
		if (summaryType == "Simple")
			graphOptionsArray = ["Column Chart", "Pie Chart","Line Chart", "Doughnut Chart"];
		else
			graphOptionsArray = ["Column 2D Chart", "Column 3D Chart", "Line 2D Chart", "Bar 2D Chart", "Area 2D Chart"];
			
		for (i=0; i<graphOptionsArray.length; i++)
		{
			var opt = document.createElement('option');
			opt.text = graphOptionsArray[i];
			opt.value = graphOptionsArray[i];		
			bceGraphType.add(opt, null);
			//bceGraphType.options[bceGraphType.length] = new Option(graphOptionsArray[i]);
			
			// Mark this as selected
			if (graphOptionsArray[i] == oldValue)
				bceGraphType.options[bceGraphType.length - 1].selected = true;
		}
		
		// Show the Date options drop-down for the Date type series and summary
		if (summaryType == "Group by date")
		{
			$("#bceGraphSummary").width(118);
			$("#bceSummayDateOptionsSpan").show();
		}
		else
		{
			$("#bceGraphSummary").width(220);
			$("#bceSummayDateOptionsSpan").hide();
		}
		
		if ($("#bceGraphSeries").val() == "Date")
		{
			$("#bceGraphSeries").width(118);
			$("#bceSeriesDateOptionsSpan").show();
		}
		else
		{
			$("#bceGraphSeries").width(220);
			$("#bceSeriesDateOptionsSpan").hide();
		}
	}),
	
	// Load/Apply Basecamp Extension preferences for the Time Graph
	ApplyPreferences : (function() {
		BasecampExt.Preferences.TimeGraph.Enabled ? $("#bceCreateGraphLink").show() : $("#bceCreateGraphLink").hide();
	}),
	
	// Initialize the time graph function
	Initialize : (function()
	{
		// Get the current active page
		activePage = BasecampExt.Globals.GetActivePage();
		
		// Check if current page is "Time"
		if (activePage == 'Time')
		{
			graphHtmlLink = ' <span id="bceCreateGraphLink"><span class="pipe">|</span> <a class="admin toggleGraphLink" href="#" id="create_time_graph">Create a graph</a></span>';
			
			// Add the Create graph link in the header links
			$(".page_header_links").first().html($(".page_header_links").first().html() + graphHtmlLink);
			
			// Build the HTML for the graph options
			var graphOption = '<div id="new_graph_option" class="new_time_report" style="display:none;width:100%"> \
			  <div class="page_header_links"><a id="cancel_graph_link" href="#" class="donelink toggleGraphLink">Cancel graph creation</a></div> \
			  <h1>Create a graph</h1> \
				<div class="box_with_fields"> \
				  <table> \
					<tbody> \
					<tr> \
					  <th style="width:100px">Summary</th> \
					  <td><select style="width:220px" id="bceGraphSummary"><option>Simple</option></select> \
					  <span id="bceSummayDateOptionsSpan" style="display:none">By <select style="width:80" id="bceSummaryDateOptions"><option>Auto</option><option>Day</option><option>Week</option><option>Month</option><option>Quarter</option><option>Year</option></span>\
					  </td> \
					</tr> \
					<tr> \
					  <th style="width:100px">Series</th> \
					  <td><select style="width:220px" id="bceGraphSeries"><option>Person</option></select> \
					  <span id="bceSeriesDateOptionsSpan" style="display:none">By <select style="width:80" id="bceSeriesDateOptions"><option>Auto</option><option>Day</option><option>Week</option><option>Month</option><option>Quarter</option><option>Year</option></span> \
					   </td> \
					</tr> \
					<tr>  \
					  <th style="width:100px">Graph Type</th>  \
					  <td><select style="width:220px" id="bceGraphType"><option>Column 3D Chart</option></select> \
					   </td>  \
					</tr>  \
				  </tbody></table> \
				</div> \
				<p class="submit"><input type="button" value="Create graph" id="btnCreateGraph" name="btnCreateGraph"> or <a class="admin toggleGraphLink">Cancel</a></p> \
			</div>';
			
			// Now insert this Graph option HTML to the header
			$(".page_header").append(graphOption);
			
			// Insert the Graph Div place holder
			$(".page_header").append('<div id="bceGraphDivWrapper" style="display:none" ><canvas id="bceGraphDiv" style="width:100%;height:500px;"></canvas></div>');
			
			// Initialize defult values
			BasecampExt.TimeGraph.PopulateSeriesAndGraphType();
			BasecampExt.TimeGraph.ApplyPreferences();
			
			// Bind Events
			$(".toggleGraphLink").click(function() {BasecampExt.TimeGraph.ToggleOptions(); return false;});
			$("#btnCreateGraph").click(function() {BasecampExt.TimeGraph.GenerateGraph();});
			
			// Bind dropdwon events
			$("#bceGraphSummary").change(function() {BasecampExt.TimeGraph.PopulateSeriesAndGraphType();});
			$("#bceGraphSeries").change(function() {BasecampExt.TimeGraph.PopulateSeriesAndGraphType();});
		}
	})
 }
 
 BasecampExt.TimeGraph = TimeGraph