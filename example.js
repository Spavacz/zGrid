//overrided alert() func. uses jquery simplemodal
function alert(msg) {
	$('#alert-modal').find('div.alert-content').html(msg);
	$('#alert-modal').modal({
		position: ["25%",],
		containerId: 'confirm-container',
		closeHTML: '<a class="button gray modal-close">OK</a>',
		onClose: function (dialog) {
			dialog.data.fadeOut('fast', function () {
				dialog.container.hide('fast', function () {
					dialog.overlay.fadeOut('fast', function () {
						$.modal.close(); // must call this!
					});
				});
			});
		},
		onOpen: function (dialog) {
			dialog.overlay.fadeIn('fast', function () {
				dialog.container.show('fast', function () {
					dialog.data.fadeIn('fast');
				});
			});
		}
	});
}
				
//overrided confirm() func. uses jquery simplemodal
function confirm(message, callback, param) {
	$('#confirm-modal').modal({
	position: ["25%",],
	containerId: 'confirm-container', 
	onShow: function (dialog) {
		$('.message', dialog.data[0]).append(message);

		// if the user clicks "yes"
		$('.yes', dialog.data[0]).click(function () {
			// call the callback
			if ($.isFunction(callback)) {
				callback(param);
			}
			if(typeof callback == 'string'){
				window.location.href = callback;
			}
			// close the dialog
			$.modal.close();
		});
	},
	onClose: function (dialog) {
		dialog.data.fadeOut('fast', function () {
			dialog.container.hide('fast', function () {
				dialog.overlay.fadeOut('fast', function () {
					$.modal.close(); // must call this!
				});
			});
		});
	},
	onOpen: function (dialog) {
		dialog.overlay.fadeIn('fast', function () {
			dialog.container.show('fast', function () {
				dialog.data.fadeIn('fast');
			});
		});
	}

		});
}	

function showSuccess(msg)
{
	$.notifyBar({
	html: msg,
	cls: "success",
	delay: 2000,
	animationSpeed: "normal"
  });  
}

function showError(msg)
{
	$.notifyBar({
	html: msg,
	cls: "error",
	delay: 2000,
	animationSpeed: "normal"
  });  
}