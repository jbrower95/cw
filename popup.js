(function() {
	$('#addCW').on('keypress', function (e) {
         if(e.which === 13){
         	let text = $(this).val();
         	$(this).val('');
         	$(this).blur();
         	async_get("cws", []).then(function(cws) {
         		cws.push(text);
         		async_put("cws", cws).then(function() {
         			refresh();
         			tellContentScriptToRefresh();
         		});
         	});
         	e.preventDefault();
         }
   	});

   	$("#enabled").change(function() {
		let checked = this.checked;
		async_put("enabled", checked).then(() => tellContentScriptToRefresh());;
	});

   	$("#removeCW").click(clearAll);
   	refresh();
})();

function refresh() {
	async_get("enabled", false).then(function(val) {
		$("#enabled").prop('checked', val);
	});

	async_get("cws").then(function(cws) {

		$("#cws").empty(); // clear 

		if (cws) {
			// add cws in
			$(cws).each(function(i, w) {
				let elt = document.createElement("li");
				elt.innerHTML = w;
				elt.className = "cw";
				$("#cws").append(elt);
			});
		}
	});	
}

function tellContentScriptToRefresh() {
	chrome.tabs.query({currentWindow: true}, function(tabs) {
		for (var i = 0; i < tabs.length; i++) {
		  chrome.tabs.sendMessage(tabs[i].id, {refresh: true}, null);
		}
	});
}

function clearAll() {
	$("#addCW").val('');
	async_put("cws", []).then(refresh);
}

