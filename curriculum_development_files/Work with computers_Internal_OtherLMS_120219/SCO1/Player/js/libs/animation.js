var animation = animation || {};

animation.fadeTo = function (a, d) {
	a = Math.max(Math.min(parseFloat(a) || 1, 1), 0),
		d = Math.max(parseInt(d) || 200, 0);
	$(this).stop().animate({ opacity: a }, d)
}