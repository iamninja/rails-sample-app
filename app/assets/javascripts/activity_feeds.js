
window.loadedActivities = [];

var addActivity = function(item) {
	var found = false;
	for (var i = 0; i < window.loadedActivities.length; i++) {
		if (window.loadedActivities[i].id == item.id) {
			found = true; 
		}
	}

	if (!found) {
		window.loadedActivities.push(item);
		window.loadedActivities.sort(function(a,b) {
			var returnValue;
			if (a.created_at > b.created_at)
				returnValue = -1;
			if (a.created_at < b.created_at)
				returnValue = 1;
			if (a.created_at == b.created_at)
				returnValue = 0;
			return returnValue;
		});
	}

	return item;
}

var renderActivities = function() {
	var source = $('#activities-template').html();
	var template = Handlebars.compile(source);
	var html = template({
		activities: window.loadedActivities,
		count: window.loadedActivities.length
	});
	var $activityFeedLink = $('li#activity-feed');

	// $activityFeedLink.empty();
	$activityFeedLink.addClass('dropdown');
	$activityFeedLink.html(html);
	$activityFeedLink.find('a.dropdown-toggle').dropdown();
}

var pollActivity = function() {
	$.ajax({
		url: Routes.activities_path({format: 'json', since: window.lastFetch}),
		type: "GET",
		dataType: "json",
		success: function(data) {
			window.lastFetch = Math.floor((new Date).getTime() / 1000);
			if (data.length > 0) {
				for (var i = 0; i < data.length; i++) {
					addActivity(data[i]);
				}

				renderActivities();
			}		
		}
	});
}

Handlebars.registerHelper('activityFeedLink', function() {
	return new Handlebars.SafeString(Routes.activities_path());
});

Handlebars.registerHelper('activityLink', function() {
	var link, path, html;
	var activity = this;
	var linkText = this.targetable_type.toLowerCase();

	switch (linkText) {
		case "status":
			path = Routes.status_path(activity.targetable_id);
			break;
		case "album":
			path = Routes.album_path(activity.profile_name, activity.targetable_id);
			break;
		case "picture":
			path = Routes.album_picture_path(activity.profile_name, activity.targetable.album_id, activity.targetable_id);
			break;
		case "userfriendship":
			path = Routes.profile_path(activity.profile_name);
			linkText = "friend";
			break;
	}

	if (activity.action === "deleted") {
		path = "#";
	}

	html = "<li><a href='"+ path +"'>" + this.user_name + " " + this.action + " a " + linkText + ".</a></li>";
	return new Handlebars.SafeString(html);
});

windowPollInterval = window.setInterval(pollActivity, 5000);
pollActivity();