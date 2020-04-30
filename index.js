module.exports = function AutoStance(mod) {

	const INTERVAL = 2000;

	let enabled = false,
		currentStamina = 0,
		buffActivated = false,
		alive = false,
		cid = -1,
		job = -1,
		mounted = false,
		intervalRef = null,
		w = 0,
		loc = {
			"x": 0,
			"y": 0,
			"z": 0
		},
		skill = {
			"reserved": 0,
			"npc": false,
			"type": 1,
			"huntingZoneId": 0,
			"id": 80400
		};
	
	mod.hook("S_LOGIN", 14, (event) => {
		cid = event.gameId;
		job = (event.templateId - 10101) % 100;
		enabled = (job == 0 && event.level == 70) ? true : false;
	});
	
	mod.hook("S_LOAD_TOPO", 3, (event) => {
		if (enabled) {
			loc = event.loc;
			mounted = false;
		}
	});
	
	mod.hook("S_SPAWN_ME", 3, (event) => {
		if (enabled) {
			loc = event.loc;
			w = event.w;
			alive = event.alive;
			tryActivateStance();
		}
	});
	
	mod.hook("C_PLAYER_LOCATION", 5, (event) => {
		if (enabled) {
			loc = event.loc;
			w = event.w;
		}
	});
	
	mod.hook("C_RETURN_TO_LOBBY", 1, (event) => {
		enabled = false;
		if (intervalRef) clearInterval(intervalRef);
	});
	
	mod.hook("S_MOUNT_VEHICLE", 2, (event) => {
		if (enabled)
		if (event.gameId == cid) mounted = true;
	});
	
	mod.hook("S_UNMOUNT_VEHICLE", 2, (event) => {
		if (enabled)
		if (event.gameId == cid) mounted = false;
	});
	
	mod.hook("S_PLAYER_CHANGE_STAMINA", 1, event => {
		if (enabled)
		  	currentStamina = event.current;
	});
	
	mod.hook("S_PLAYER_STAT_UPDATE", 14, (event) => {
		if (enabled)
		  	currentStamina = event.stamina;
	});

	mod.hook("S_ABNORMALITY_BEGIN", 4, (event) => {
		if (enabled)
			if (event.source == cid)
				if (100150 == event.id)
					buffActivated = true;	
	});
	
	mod.hook("S_ABNORMALITY_END", 1, (event) => {
		if (enabled)
			if (event.target == cid)
				if (100150 == event.id)
					buffActivated = false;
	});
	
	function tryActivateStance() {
		if (intervalRef) clearInterval(intervalRef);
		
		intervalRef = setInterval(() => {
			if (!buffActivated) {
				if (currentStamina < 1000 || mounted || !alive) return;
				
				mod.toServer("C_START_SKILL", 7, {
				skill: skill,
				w: w,
				loc: loc,
				//dest: dest, 
				unk: false,
				moving: false,
				continue: false,
				//target: 0n,
				unk2: false
				});
			} else clearInterval(intervalRef);
		}, INTERVAL);
	};
};