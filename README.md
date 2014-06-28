Search_With_Categorization
==========================

Search bar with suggestions that categorizes the results.
The category bar will float along with the scroll to maintain the context for users.



USAGE
======

Add this HTML <div> to your page:
    <div class="searchform"></div>
And import search.css and search.js for the searchbar to initialise.



GETTING STARTED
===============

Data returned to the search bar is assumed to be JSON with 3 properties in each item: key, description and type.
The returned data should already be sorted by type so that categorization will not repeat (i.e. all grouped together if similar type).
key is the value to work with upon select.
description is the label to show on the searchbar's results.



CUSTOMIZATION
==============

Handle your own data source at the search.js's _search function.
Handle your own click/select event at the search.js's _select function.
Feel free to change the css for different look and feel.
