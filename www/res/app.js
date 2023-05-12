let interstitial;
document.addEventListener("deviceready", onDeviceReady, false);

	
function onDeviceReady() {

		var app = new Framework7({  
	  // App root element
	  root: '#app',
	  // App Name
	  name: 'PomoClock',
	  // App id
	  id: 'com.myapp.test',
	  // Enable swipe panel
	  panel: {
		//swipe: 'left',
	  },
	  // Add default routes
	  
	  theme: 'md'
	});



	var $$ = Dom7;

	function OneSignalInit() {
		// Uncomment to set OneSignal device logging to VERBOSE  
		// window.plugins.OneSignal.setLogLevel(6, 0);
		
		// NOTE: Update the setAppId value below with your OneSignal AppId.
		window.plugins.OneSignal.setAppId("ONESIGNALAPPID");
		window.plugins.OneSignal.setNotificationOpenedHandler(function(jsonData) {
			console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
		});
		
		//Prompts the user for notification permissions.
		//    * Since this shows a generic native prompt, we recommend instead using an In-App Message to prompt for notification permission (See step 6) to better communicate to your users what notifications they will get.
		window.plugins.OneSignal.promptForPushNotificationsWithUserResponse(function(accepted) {
			console.log("User accepted notifications: " + accepted);
		});
	}
	
	OneSignalInit();


	   
	   //Admob
	  interstitial = new admob.InterstitialAd({
		adUnitId: 'ca-app-pub-111111111111111111/2222222222222', //Prod
		//adUnitId: 'ca-app-pub-111111111111111111111/222222', //Test
	  })
	
	interstitial.load();  
	
	//Anúncio é fechado
	document.addEventListener('admob.ad.dismiss', async () => {
	  
	  //Inicia o carregamento de outro
	  await interstitial.load()
	  
	  //Reinicia o contador sozinho, mas sem o aviso de anúncio (parâmetro 'false')
	  //inicia_contador_ciclo(false);
	})
	
	
  
  
 

	
	

	//Home
	$$(document).on('page:init', '.page[data-name="home"]', function (e) {	
		//Checa se é a primeira execução
		if(!localStorage.primeira_exec){
			
			//Roda a Intro
			Intro();		
			localStorage.primeira_exec = true;
		}
		
		//Binds de clicks
		$$('.ajuda').click(function(){
			Intro();
		})
		
		$$('.btn_config').click(function(){
			popup_config();
		})
	
				
		$$('.info').click(function(){
				/*var device_info = ' - Modelo: '+device.model+
								' - Plataforma: '+device.platform+
								' - Versão: '+device.version+
								' - Fabricante: '+device.manufacturer;*/
								
				
								
				var html_popup_info = '<div class="popup">'+	

											'<div class="card">'+
												 '<div class="card-header"><h2>Sobre a Técnica Pomodoro</h2></div>'+
												 '<div class="card-content card-content-padding">'+
													'<ul>'+
														'<li>A Técnica Pomodoro é um método de gerenciamento de tempo desenvolvido por Francesco Cirillo no final dos anos 1980</li><br>'+
														'<li>A técnica consiste na utilização de um cronômetro para dividir o trabalho em períodos de 25 minutos (por padrão), separados por breves intervalos</li><br>'+
														'<li>Seu nome deriva da palavra italiana pomodoro (tomate), como referência ao popular cronômetro gastronômico na forma dessa fruta. O método é baseado na ideia de que pausas frequentes podem aumentar a agilidade mental</li>'+
												 '</div>'+
												  '<div class="card-footer">'+app.name+' v1.0.3, por Pedro Neto Web<a style="margin: auto; width: 100%;" class="link external" href="mailto:apps@pedronetoweb.com.br?subject=PomoClock"><button class="contato col button button-fill color-green">Contato</button></a></div>'+
												  '<button class="popup-close col button button-fill color-blue compartilhar">Compartilhar</button>'+
												'<button class="popup-close col button button-fill color-orange">Fechar</button>'

										'</div>';
				var popup_info = app.popup.create({
					content: html_popup_info
				})
				
				popup_info.open();
				
				/* $$('.contato').click(function(){
					window.open('mailto:apps@pedronetoweb.com.br?subject=Contato via '+app.name+' - '+device_info+'','_system');
				}) */
				
				$$('.compartilhar').click(function(){
					/* var options = {
					  message: 'Tô usando o PomoClock pra gerenciar o tempo do que eu faço. Dá uma olhada aqui -> https://play.google.com/store/apps/details?id=com.pamn.pomoclock', // not supported on some apps (Facebook, Instagram)
					  subject: 'PomoClock', // fi. for email
					  chooserTitle: 'Ajude mais alguém a gerenciar seu tempo :)' // Android only, you can override the default share sheet title,
					};
					 
					var onSuccess = function(result) {
					  console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
					  console.log("Shared to app: " + result.app); // On Android result.app since plugin version 5.4.0 this is no longer empty. On iOS it's empty when sharing is cancelled (result.completed=false)
					};
					 
					var onError = function(msg) {
					  console.log("Sharing failed with message: " + msg);
					};
					 
					window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError); */
					
					navigator.share({
						title: 'Compartilhar',
						text: 'Tô usando o PomoClock pra gerenciar o tempo do que eu faço',
						url: 'https://play.google.com/store/apps/details?id=com.pamn.pomoclock'
					}).then((packageNames) => {
						if (packageNames.length > 0) {
							console.log("Shared successfully with activity", packageNames[0]);
						} else {
							console.log("Share was aborted");
						}
					}).catch((err) => {
						console.error("Share failed:", err.message);
					});
				})
			})	
		
		//Inicializador para o contador de descanso
		sessionStorage.contador_descanso_iniciado = 'false';
		
		//Definições
		if(!localStorage.tempo_padrao || !localStorage.descanso_padrao){
			localStorage.tempo_padrao = 1500; //1500 - 25 minutos
			localStorage.descanso_padrao = 300; //300 - 5 minutos				
		}	
		
		var tempo_padrao = localStorage.tempo_padrao; 
		var descanso_padrao = localStorage.descanso_padrao; 
		
		
		//Gauge
		var gauge = app.gauge.create({
		  el: '.gauge',
		  type: 'circle',
		  value: 1,
		  size: 250,
		  borderColor: 'red',
		  borderBgColor: 'white',
		  borderWidth: 10,
		  valueText: segundos_em_minutos(localStorage.tempo_padrao),
		  valueFontSize: 41,
		  valueTextColor: 'red',
		  labelText: 'Com '+Math.floor(localStorage.descanso_padrao / 60)+' minutos de descanso',
		  labelTextColor: 'red'
		});
		
		//Gerencia os eventos (tap, hold)
		var elemento = document.getElementById('gauge');
		var hammertime = new Hammer(elemento);
		var x;
		sessionStorage.tempo = localStorage.tempo_padrao;
		
		hammertime.on('tap', function(ev) {
			if(sessionStorage.contador_descanso_iniciado != 'true'){
				inicia_contador_ciclo();
			}
			else{
				//Alerta de Long press para mais opções
				 var longPressForMore = app.toast.create({
					text: 'Toque e segure o contador para mais opções',
					closeTimeout: 2000,
				  });
				  longPressForMore.open();
			}
				
		});
		
		hammertime.on('press', function(ev) {
			
			if(sessionStorage.contador_descanso_iniciado == 'true'){
				var dialog = app.dialog.create({
						buttons: [
						  {
							text: 'Pular',
							onClick: function(){							
									sessionStorage.descanso = 0;
							}
						  },
						  {
							text: 'Config.',
							onClick: function(){							
								popup_config();
							}
						  },
							{
							text: 'Fechar'
						  }
						],
						title: 'Confirmação',
						text: 'O que deseja fazer?',
						closeByBackdropClick: true
					})
					
					dialog.open();
			}
			else{
				//Abre o pop-up e preenche com os valores do localStorage
				popup_config();
			}
			
			
		
			
		});
		
			//Handler para o botão salvar nas configurações
			$$('.salvar_conf').click(function(){
				if($$('.ciclo').val() == '' || $$('.ciclo').val() == 0 || $$('.descanso').val() == '' || $$('.descanso').val() == 0){
					app.dialog.alert('Os valores não podem ser zero, nem ficar em branco','Ops');
				}
				else{
						
						var dialog = app.dialog.create({
						buttons: [
						  {
							text: 'Cancelar',
						  },
						  {
							text: 'OK',
							onClick: function(){		
									
									//Obtém os valores inseridos e atualiza os localStorage
									localStorage.tempo_padrao = $$('.ciclo').val() * 60;
									localStorage.descanso_padrao = $$('.descanso').val() * 60;
									sessionStorage.tempo = localStorage.tempo_padrao;
									
									//Pausa o contador
									clearInterval(x);
									
									//Reseta o contador
									gauge.update({
										valueText: segundos_em_minutos(localStorage.tempo_padrao),
										labelText: 'Com '+Math.floor(localStorage.descanso_padrao / 60)+' minutos de descanso',
										borderColor: 'red',
										value: 1
									});	
									$$('.hidden').attr('data-exec','false');
									app.popup.close('.popup', true);
									
									//Limpa todo e qualquer setInterval (necessário, pois estão encapusulados dentro de funções)
									parar_todos_timers();
									
									sessionStorage.contador_descanso_iniciado = 'false';
									
									$$('.tomate').hide();
								}
						  }
						],
						title: 'Confirmação',
						text: 'Isso vai reiniciar o contador. Deseja realmente alterar?',
						closeByBackdropClick: true
					})
					
					dialog.open();
				}
				
				
				
				
			
			})
			
			/************************************************ FUNCÕES ************************************************/
		
		//Conversão de segundos em minutos
		function segundos_em_minutos(seconds){
			var minutes = Math.floor(seconds / 60);
			var seconds = (seconds % 60);

			if(minutes < 10){
				minutes = '0'+minutes;
			}

			if(seconds < 10){
				seconds = '0'+seconds;
			}
			return minutes+':'+seconds;
		}
		
		
		function inicia_contador_ciclo(exibirAd = true, retomada_de_trabalho = false){				
				
				//Atualiza gauge
				gauge.update({
					labelText: 'Com '+Math.floor(localStorage.descanso_padrao / 60)+' minutos de descanso',
					borderColor: 'red'
				});

				
				
					
				
				//Se o Timer não está correndo, inicia
				if($$('.hidden').data('exec') == 'false'){
					
					//Caso esteja iniciando e não seja uma retomada de trabalho (iniciado automaticamente depois do descanso)
					if(retomada_de_trabalho == false){
						beep('INICIANDO_CONTADOR');
					}
					
					var adNotif = app.notification.create({
						  //icon: '<i class="icon icon-f7"></i>',
						  title: 'Alerta de anúncio',
						  titleRightText: 'agora',
						  subtitle: 'Um anúncio poderá aparecer agora. Mantenha o foco para ver menos anúncios ',
						  //text: 'This is a simple notification message',
						  closeTimeout: 3000,
					});
					
					
					//Verifica se o tempo atual corresponde ao tempo inicial configurado
					//if(sessionStorage.tempo == localStorage.tempo_padrao){
						//interstitial.show()
					
					//Se true, exibie o anúncio
					if(exibirAd == true){						
						
						adNotif.open();
						
						setTimeout(function() {
						  interstitial.show();
						}, 3000);
					}
						
					//}
					
					
					$$('.hidden').data('exec','true');
					$$('.tomate').show();
					$$('.tomate').removeClass('ld-swim');
					$$('.tomate').addClass('ld-clock');
					//beep('ciclo');
					navigator.vibrate([2000]);
					
					x = setInterval(function(){
						sessionStorage.tempo = sessionStorage.tempo - 1;			
						gauge.update({
							valueText: segundos_em_minutos(sessionStorage.tempo),
							value: sessionStorage.tempo / localStorage.tempo_padrao
						});	
						
						//Check para áudio
						if(sessionStorage.tempo == 60){
							//1 min para descanso
							beep('UM_MIN_PARA_DESCANSO');
						}
						else if(sessionStorage.tempo == 300){
							//1 min para descanso
							beep('CINCO_MIN_PARA_DESCANSO');
						}
						/*cordova.plugins.notification.local.schedule({
							title: 'Pomodoro em progresso',
							text: 'Pomodoro em progresso',
							progressBar: { value: sessionStorage.tempo / localStorage.tempo_padrao }
						});*/
						
						/*function showProgressBarNotification() {
						  var title = "Teste Title";
						  var message = "Teste message";
						  var maxProgress = 100;
						  cordova.exec(null, null, 'ProgressBarNotification', 'show', [title, message, maxProgress]);

						}

						showProgressBarNotification();*/


						
						//Se o tempo é atingir 0, para o contador e inicia o contador do descanso
						if(sessionStorage.tempo == 0){
														
							//Para o contador
							clearInterval(x);
							
							//Exec é false (marcar como "não está executando")
							$$('.hidden').data('exec','false');
							
							//Seta a sessionStorage igual ao tempo do localStorage, para que ele reinicie a contagem com o valor padrão OU salvo pelo usuário. ParseInt para reconhecer como inteiro e '+1' para iniciar exatamente no tempo (estava iniciando tempo-1, pois a primeira operação no setInterval é justamente a subtração do tempo em 1)
							sessionStorage.tempo = parseInt(localStorage.tempo_padrao) + 1;
							
							//Inicia o contador de descanso
							inicia_contador_descanso();
						}
						
						
					}, 1000);
					
				}
				else{
					//Timer está correndo. Para			
					$$('.hidden').data('exec','false');
					clearInterval(x);
					$$('.tomate').hide();
					beep('PAUSANDO_CONTADOR')
					
				}
			
		}
		
		
		function inicia_contador_descanso(){
			beep('DESCANSO');
			navigator.vibrate([2000]);
			$$('.tomate').removeClass('ld-clock');
			$$('.tomate').addClass('ld-swim');
			sessionStorage.contador_descanso_iniciado = 'true';
			
			//Obtém o tempo de descanso padrão OU salvo pelo usuário
			sessionStorage.descanso = localStorage.descanso_padrao;
			
			var y = setInterval(function(){
					gauge.update({
						valueText: segundos_em_minutos(sessionStorage.descanso),
						labelText: 'Iniciado descanso de '+Math.floor(localStorage.descanso_padrao / 60)+' minutos',
						borderColor: '#1cd2dc',
						value: sessionStorage.descanso / localStorage.descanso_padrao
					});	
					
					
					//Se o tempo é atingir 0, para o contador e inicia o contador de ciclo
					if(sessionStorage.descanso == 0){
						beep('DE_VOLTA_AO_TRABALHO');
						clearInterval(y);
						sessionStorage.contador_descanso_iniciado = 'false';
						inicia_contador_ciclo(false, true);
					}
					
					if(sessionStorage.descanso == 60){
						beep('UM_MIN_PARA_VOLTAR')
					}
					sessionStorage.descanso = sessionStorage.descanso - 1;
					
				}, 1000);
		}
		
		function parar_todos_timers(){
			for(i=0; i<10000; i++){
				window.clearInterval(i);
			}
		}

		function popup_config(){
			app.popup.open('.popup', true);
				  var formData = {
					'ciclo': Math.floor(localStorage.tempo_padrao / 60),
					'descanso': Math.floor(localStorage.descanso_padrao / 60)
				  }
				  app.form.fillFromData('#form', formData);
			
			
		}
		
		function Intro(){
			var intro = introJs();
			  intro.setOptions({
				steps: [
				  { 
					intro: "Bem-vindo ao "+app.name
				  },
				   { 
					intro: "A Técnica Pomodoro divide o seu trabalho em partes e te ajuda a concluir sem deixar pra depois"
				  },
				   { 
					intro: "Toque no contador, trabalhe com foco total até o início da pausa. Repita o ciclo até suas tarefas serem concluídas =D"
				  },
				   { 
					intro: "Avisos sonoros te alertarão sobre a hora da pausa e do trabalho"
				  },
				  {
					element: document.querySelector('.gauge'),
					intro: "Este é o seu contador Pomodoro. Toque para iniciar ou pausar e mantenha pressionado para opções extras :)"
				  },
				   { 
					intro: "É isso. Let's Go! =D"
				  }
				],
				nextLabel: "Próximo",
				prevLabel: "Anterior",
				skipLabel: "Pular Tutorial",
				doneLabel: "Terminar"
			  });
			  intro.onbeforeexit(function () {
				  var toastSwipe = app.toast.create({
					text: 'Toque e segure o contador para mais opções, seja no tempo normal ou descanso. Você pode reiniciar o tutorial no ícone de ajuda',
					closeTimeout: 7000,
				  });
				  toastSwipe.open();
				});
				
			  intro.start();
		  }
		  
		  
		  function beep(str){
			  
			  if(str == 'UM_MIN_PARA_DESCANSO'){
				 var audio = new Audio('audio/camila/um_min_para_descanso.mp3');
				 audio.play(); 
			  }
			  else if(str == 'CINCO_MIN_PARA_DESCANSO'){
				 var audio = new Audio('audio/camila/cinco_min_para_descanso.mp3');
				 audio.play(); 
			  }
			  else if(str == 'INICIANDO_CONTADOR'){
				 var audio = new Audio('audio/camila/iniciando_contador.mp3');
				 audio.play(); 
			  }
			  else if(str == 'DESCANSO'){
				 var audio = new Audio('audio/camila/descanso.mp3');
				 audio.play(); 
			  }
			  else if(str == 'DE_VOLTA_AO_TRABALHO'){
				 var audio = new Audio('audio/camila/de_volta_ao_trabalho.mp3');
				 audio.play(); 
			  }
			  else if(str == 'PAUSANDO_CONTADOR'){
				 var audio = new Audio('audio/camila/pausando_contador.mp3');
				 audio.play(); 
			  }
			  else if(str == 'UM_MIN_PARA_VOLTAR'){
				  var audio = new Audio('audio/camila/um_minuto_para_voltar.mp3');
				 audio.play(); 
			  }
			  
			  /*if(tipo == 'ciclo'){
				 var audio = new Audio('audio/alert_1.mp3');
				 audio.play(); 
			  }
			  else{
				   var audio = new Audio('audio/alert_2.mp3');
				   audio.play();
			  }*/
			  
		  }
		  
		
		
	})




	//View (tem que ser declarado por último, senão as funções acima não funcionam)
	var mainView = app.views.create('.view-main');
}