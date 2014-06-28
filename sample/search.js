var searchbar = searchbar || {};
(
  function() {
  	/**********************************************************************
	**** OVERWRITE THESE WITH YOUR OWN IMPLEMENTATIONS AND DATA SOURCE ****
  	**********************************************************************/
	/*** Action upon selecting an item, parameter is expected to be one of the <a> result options ***/
	var _select = function() {
		var selected = jQuery('.searchform .searchresults .selected');

		if (selected.length > 0) {
			selected = selected.eq(0);		
			jQuery('#selection').text(
				"Key: " + selected.attr('data-key') + "; "
				+ "Type: " + selected.attr('data-type'));
		}
	}
	
	/*** Get suggestions given query via AJAX and appends the result HTML into DOM ***/
	var _suggest = function(query) {
		// Clear any existing search results
		jQuery('.searchform .suggestions').html('');
		
		// Fire AJAX GET here
		var data = [{'description':'(ORCL) Oracle Corp', 'key':'Oracle Corp', 'type':'COMPANY'}, {'description':'(AAPL) Apple Inc', 'key':'Apple Inc', 'type':'COMPANY'}, {'description':'(GOOG) Google Inc', 'key':'Google Inc', 'type':'COMPANY'}, {'description':'(DATA) Tableau Software', 'key':'Tableau Software', 'type':'COMPANY'}, {'description':'Singapore', 'key':'Singapore', 'type':'COUNTRY'}, {'description':'Michael Jordan (NBA)', 'key':'Michael Jordan', 'type':'PEOPLE'}, {'description':'Larry Page (GOOG)', 'key':'Larry Page', 'type':'PEOPLE'}, {'description':'Tim Cook (AAPL)', 'key':'Tim Cook', 'type':'PEOPLE'}, {'description':'Steve Jobs (AAPL)', 'key':'Steve Jobs', 'type':'PEOPLE'}, {'description':'Programmer', 'key':'Programmer', 'type':'JOB'}, {'description':'Analyst', 'key':'Analyst', 'type':'JOB'}, {'description':'Manager', 'key':'Manager', 'type':'JOB'}];
		if (data.length === 0) return;
			
		_fillSuggest(query, data);
	}


  
  	/**********************************************************************
	**************************** ORIGINAL CODES ***************************
  	**********************************************************************/
	/*** Constants ***/
	var CONSTANTS = {
		keys: {UP: 38, DOWN: 40, ENTER: 13, TAB: 9}
	};

	/*** Instance Properties ***/
	var SuggestEventID = 0;
	
	/*** Keypress event to fire a search with query and render suggestions ***/
	var _search = function() {
		var searchbar = jQuery('.searchform .searching');
		_suggest(searchbar.val());
		
		var searchbar_height = searchbar.outerHeight();
		var searchbar_offset = searchbar.offset();
		
		var suggestionboxes = searchbar
			.closest('.searchform')
			.find('.suggestions')
			.each(function() {
				var t = jQuery(this);
				t.css('left', searchbar_offset.left)
					.css('top', searchbar_offset.top + searchbar_height)
					.show();
			});
		
		jQuery('.searchform .suggestions').scrollTop(0).show();
	}
    
	/*** Populate suggestion results with data, and bold the searched query terms ***/
	var _fillSuggest = function(query, data) {
			// Format returned JSON result to HTML
			var searchresults = jQuery('<div class="searchresults"></div>');
			var suggestion_height = 0;
			var currType;

			for (var i = 0; i < data.length; i++) {
				if (data[i].type != currType) {
					currType = data[i].type;
					searchresults.append('<span class="category">' + data[i].type + '</span>');
				}
				
				// Bold the searched text in the description, while retaining original string's case
				var regex = new RegExp(query,"ig");
				var inx = 0;
				var des = "";
				while ((result = regex.exec(data[i].description)) ) {
					des = des + data[i].description.substring(inx, result.index)
							+ "<strong>" + data[i].description.substring(result.index, result.index + query.length) + "</strong>";
					inx = result.index + query.length;
				}
				des = des + data[i].description.substring(inx)
				
				
				// Add result item to suggestion result list
				searchresults.append('<a data-key="' + data[i].key + '" data-type="' + data[i].type + '"><span>' + des + '</span></a>');
			}
			var suggestionBox = jQuery('.searchform .suggestions');
			suggestionBox.html(searchresults);
						
			// Shorten suggestion box if results aren't many
			suggestionBox.find('span').each(function(){
				suggestion_height = suggestion_height + jQuery(this).height();				
				if (suggestion_height > suggestionBox.height()) return false; // break loop
			});
			if (suggestion_height < suggestionBox.height()) // set new height if items total up to lesser than original suggestion box height
				suggestionBox.height(suggestion_height + 2); // +2 to give scrollbar some leeway and it will not appear
	}
	
	/*** Scrolls the viewport to ensure selected item is in view ***/ 
	var _scroll_into_view = function() {
			// Scroll down to selection
			var viewport = jQuery('.searchform .suggestions');
			var selected = jQuery('.searchform .searchresults .selected');
			
			// There should be only 1 selected item
			selected.each(function() {
				// If below the viewport
				if (selected.position().top + selected.height() > viewport.height()) {
					viewport.scrollTop(
						viewport.scrollTop() + selected.position().top + selected.height() - viewport.height()
					);
				}
				// If above the viewport
				else {
					var cat = selected.prevAll('.category').eq(0);
					if (selected.position().top < 0 + cat.height()) {
						viewport.scrollTop(
							viewport.scrollTop() + selected.position().top - cat.height() // Move up to the selected item, and up by a height to cater for category
						);
					}
				}
			});
		}
	
	/*** Initialise some HTML elements for the searchbar and default keypress events ***/	
	this._init = function() {	
		/*** Initialise new Search inputs ***/
		jQuery('.searchform').each(function(){
			jQuery(this).html(
				'<div><input class="searchbar" type="text"/>'
				+ '<input type="button" class="searchbutton"/></div>'
				+ '<div class="suggestions"></div>'
			);
		});
		
		/*** Search Bar key events ***/
		jQuery('.searchform .searchbar')
			// Show suggestions when typed in bar 
			.keyup(function(e){
				// End activity if no query string
				if (!jQuery(this).val()) {
					clearTimeout(SuggestEventID);
					document.onclick();
					return false;
				}
			
				// Otherwise handle the key press event
				var keynum = e.keyCode;

				if (keynum === CONSTANTS.keys.UP) {
					var selected = jQuery('.searchform .searchresults a.selected');
					
					// Something selected, go up to prev item
					if (selected.length > 0 && selected.prevAll('a').length > 0) {
						selected
							.removeClass('selected')
							.prevAll('a').eq(0).addClass('selected');
					}
					
					// Scroll down to selection
					_scroll_into_view();
				}
				
				else if (keynum === CONSTANTS.keys.DOWN) {
					var selected = jQuery('.searchform .searchresults a.selected');
					
					// Nothing selected yet
					if (selected.length === 0) {
						var items = jQuery('.searchresults a');
						if (items.length > 0) selected = items.eq(0).addClass('selected');
					}
					// Something selected, go down to next item
					else if (selected.length > 0 && selected.nextAll('a').length > 0) {
						selected = selected
							.removeClass('selected')
							.nextAll('a').eq(0).addClass('selected');
					}
					
					// Scroll down to selection
					_scroll_into_view();
				}
				
				else if (keynum === CONSTANTS.keys.ENTER || keynum === CONSTANTS.keys.TAB) {
					_select();
					document.onclick(); // Hide the suggestions
				}
				
				else {
					jQuery(this).addClass('searching');
				
					if (SuggestEventID)
						clearTimeout(SuggestEventID);
					SuggestEventID = setTimeout(function() { _search(); }, 300);
				}
			})
			// Prevent Tab key from tabbing to other html elements
			.keydown(function(e){
				if (e.keyCode === CONSTANTS.keys.TAB) e.preventDefault();
			});
	
	
	
		/*** Suggestion list click event ***/
		jQuery('.searchform .suggestions')
			.click(function(e) {
				jQuery(this).find('a').removeClass('selected');				
				x = e.target;
				var a = e.target.parentElement; //e.target is the <span> element
				a.className = a.className + " selected";
				
				_select();
			});

			
		/*** Search Button event ***/	
		jQuery('.searchform .searchbutton')
			.click(function(e) {
				_select();
			});
		
	
		/*** Hide suggestions when clicked elsewhere ***/
		var existingEvents = document.onclick ? document.onclick : function() {};
		document.onclick = function() {
			existingEvents();
			jQuery('.searchform .suggestions').hide();
			jQuery('.searchform .searchbar').val("");
		};
	
	
		  
		/*** Hide suggestions when window resized ***/
		var existingEvents = window.onresize ? window.onresize : function() {};
		window.onresize = function() {
			existingEvents();
			jQuery('.searchform .suggestions').hide();
			jQuery('.searchform .searchbar').val("");
		};
    
	
	
		/*** Keep category at top while scrolling ***/
		jQuery('.searchform .suggestions').scroll(function() {		
			jQuery('.searchresults .category').each(function (scrollDist){
				var viewport = jQuery(this).closest('.suggestions');			
				var t = jQuery(this);

				
				if (t.position().top >= 0 && t.position().top <= viewport.height()) {
					// Stick to top
					var new_top = parseInt(t.css('top')) - t.position().top;
					
					// But cannot be above its original css level
					if (new_top < 0) new_top = 0;
					
					t.css('top', new_top);
				}
				else if (t.position().top < 0) {
					// Get current css top position, or it is 0 if unchanged before.
					var original_top = parseInt(t.css('top')) || 0;
					t.css('top', original_top - t.position().top);
					
					// Find the next category, to ensure not overlapping it
					var n = t.nextAll('.searchresults .category');
					if (n.length > 0) {
						n = n.eq(0); // next category, cannot overlap it
				
						// If overlapping into the next category
						if (n.position().top < t.position().top + t.height())
						{
							// Can't work with css('top') of next item, as it could be "auto"
							var new_top = 
							t.css('top', 
								parseInt(t.css('top')) // current top position minus the amount overlapped into next category
								 - (t.position().top + t.height() - n.position().top)
							);
						}
					}
				}
				else if (t.position().top > viewport.height()) {
				}
			});
		});
	};
  }
).apply(searchbar);
searchbar._init();