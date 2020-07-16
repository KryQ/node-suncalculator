// Converts from degrees to radians.
Math.radians = function (degrees) {
	return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function (radians) {
	return radians * 180 / Math.PI;
};

const dateToJulianDay = date => {
	const year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();

	const a = Math.round(year / 100)
	const c = 2 - a + (a / 4);
	const e = 365.25 * (year + 4716)
	const f = 30.6001 * (month + 1)

	return c + day + e + f - 1515.5; //1524.5;
}

export const calculateSunMovements = (lat, lon, timezone = 0) => {
	const julian_day = dateToJulianDay(new Date());
	const julian_century = (julian_day - 2451545) / 36525
	const geom_mean_long = (280.46646 + julian_century * (36000.76983 + julian_century * 0.0003032)) % 360
	const geom_mean_anom = 357.52911 + julian_century * (35999.05029 - 0.0001537 * julian_century)
	const eccent_orbit = 0.016708634 - julian_century * (0.000042037 + 0.0000001267 * julian_century)
	const sun_eq_of_ctr = Math.sin(Math.radians(geom_mean_anom)) * (1.914602 - julian_century * (0.004817 + 0.000014 * julian_century)) + Math.sin(Math.radians(2 * geom_mean_anom)) * (0.019993 - 0.000101 * julian_century) + Math.sin(Math.radians(3 * geom_mean_anom)) * 0.000289
	const sun_true_long = geom_mean_long + sun_eq_of_ctr;
	//const sun_true_anom = geom_mean_anom + sun_eq_of_ctr;
	//const sun_rad_vector = (1.000001018 * (1 - eccent_orbit ^ 2)) / (1 + eccent_orbit * Math.cos(Math.radians(sun_true_anom)))
	const sun_app_long = sun_true_long - 0.00569 - 0.00478 * Math.sin(Math.radians(125.04 - 1934.136 * julian_century))
	const mean_obliq_ecliptic = 23 + (26 + ((21.448 - julian_century * (46.815 + julian_century * (0.00059 - julian_century * 0.001813)))) / 60) / 60
	const obliq_corr = mean_obliq_ecliptic + 0.00256 * Math.cos(Math.radians(125.04 - 1934.136 * julian_century))
	/*const sun_rt_ascen = Math.degrees(Math.atan2(
		Math.cos(Math.radians(obliq_corr) * Math.sin(Math.radians(sun_app_long))),
		Math.cos(Math.radians(sun_app_long))
	))*/
	const sun_declin = Math.degrees(Math.asin(Math.sin(Math.radians(obliq_corr)) * Math.sin(Math.radians(sun_app_long))))
	const y = Math.tan(Math.radians(obliq_corr / 2)) * Math.tan(Math.radians(obliq_corr / 2))
	const eq_of_time = 4 * Math.degrees(y * Math.sin(2 * Math.radians(geom_mean_long)) - 2 * eccent_orbit * Math.sin(Math.radians(geom_mean_anom)) + 4 * eccent_orbit * y * Math.sin(Math.radians(geom_mean_anom)) * Math.cos(2 * Math.random(geom_mean_long)) - 0.5 * y * y * Math.sin(4 * Math.radians(geom_mean_long)) - 1.25 * eccent_orbit * eccent_orbit * Math.sin(2 * Math.radians(geom_mean_anom)))
	const ha_sunrise = Math.degrees(Math.acos(Math.cos(Math.radians(90.833)) / (Math.cos(Math.radians(latitude)) * Math.cos(Math.radians(sun_declin))) - Math.tan(Math.radians(latitude)) * Math.tan(Math.radians(sun_declin))))
	const solar_noon = (720 - 4 * longitude - eq_of_time + timezone * 60) / 1440
	const sunrise = (solar_noon * 1440 - ha_sunrise * 4) / 1440
	const sunset = (solar_noon * 1440 + ha_sunrise * 4) / 1440
	const sunlight_duration = ha_sunrise * 8;
	const solar_time = 1440 + (eq_of_time + 4 * lon - 60 * timezone) % 1440

	return {
		sunlight_duration: sunlight_duration,
		solar_time: solar_time,
		solar_noon: solar_noon,
		sunrise: sunrise,
		sunset: sunset
	}
}

export const floatToDate = date => {
	const seconds_in_day = 24 * 60 * 60;
	const date_seconds = seconds_in_day * date;
	const hour = Math.floor(date_seconds / 60 / 60)
	const minutes = Math.floor((date_seconds % (60 * 60)) / 60)
	const seconds = Math.floor((date_seconds % (60 * 60 * 60)) / 60 / 60)

	return `${hour}:${minutes}:${seconds}`
}