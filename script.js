// Fazemos que o código só funcione apos o carregamento completo da pagina
window.addEventListener('DOMContentLoaded', function(){
  //addEventListener: função q faz o segundo parametro ser executado quando o primeiro é acionado

  // Verificamos se o navegador tem suporte ao Speech API
  if(window.SpeechRecognition || window.webkitSpeechRecognition){

    // Instanciamos o nosso botão
    var btnMicro = document.querySelector('#micro');
    var txtMicro = document.querySelector('#parag2');
    var txtInfo = document.querySelector('#parag1');
    var linhaDeComando = document.querySelector('#comando');

    // Crio a variavel que amarzenará a transcrição do audio
    var transcricao_audio =  '';

    var pode_gravar = false;

    var salvar = false;

    // Seto o valor false para a variavel esta_gravando para fazermos a validação se iniciou a gravação
    var esta_gravando = false;

    // Verificamos se o navegador tem suporte ao Speech API
    // Como não sabemos qual biblioteca usada pelo navegador, atribuimos a api retornada pelo navegador
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    // Criamos um novo objeto com a API Speech, estanciando-a
    var reconhecimento = new SpeechRecognition();

    // Defino se a gravação será continua ou não
    //.continuous nos permite continuar gravando mesmo quando o usuário faz uma pausa mais longa. 
    // Se falso, a gravação será interrompida após alguns segundos de silêncio (4 a 5 segundos).
    // Se verdadeiro, o período de silêncio é mais longo (cerca de 15 segundos).
    reconhecimento.continuous = true;

    // Especifico se o resultado final pode ser alterado ou não pela compreenção da api
    reconhecimento.interimResults = false;

    // Especifico o idioma utilizado pelo usuario
    reconhecimento.lang = "pt-BR";

    reconhecimento.start();

    // Associamos a ação de inicio de gravação ao click do botão, e iniciamos ou paramos a gravação, dependendo da variavel de //controle 'esta_gravando'
    btnMicro.addEventListener('click', function(e){
      // Verifico se esta gravando ou não
      if(pode_gravar){
        // Se estiver gravando coloco no botão a opção de parar a gravação
        pode_gravar = false;
        txtMicro.innerHTML = 'Gravar';
        txtInfo.innerHTML  = 'Captando áudio em segundo plano.';
        document.getElementById("fita").setAttribute('src','fita-estatica.png')
      }else{
        // Caso não esteja capturando o audio inicia a transcrição
        pode_gravar = true;
        txtMicro.innerHTML = 'Parar gravação.';
        txtInfo.innerHTML = 'Registrando áudio na ata';
        document.getElementById("fita").setAttribute('src','fita.png')
      }
    }, false);

    // .onstart define um callback que é disparado quando o serviço de reconhecimento começou a ouvir o áudio, com a intenção de reconhecer.
    // uso o metodo onstart para setar a minha variavel 'esta_gravando' como true, e modificar o texto do botão.
    reconhecimento.onstart = function(){
      esta_gravando = true;
      
      console.log('rodou on start')
      console.log('status do pode gravar: ' + pode_gravar)
    };

    // .onend é um método q define um callback que é disparado quando o serviço foi desligado. 
    // O evento deve sempre ser gerado quando a sessão termina, não importa qual a razão.
    // uso o metodo onend para setar a minha variavel 'esta_gravando' como false e modificar o texto do botão.
    reconhecimento.onend = function(){
      console.log('finalizou o reconhecimento')
      reconhecimento.start();

      //txtInfo.innerHTML = 'Aperte o botão para continuar';
      //txtMicro.innerHTML = 'Gravar';
    };

    reconhecimento.onerror = function(event){
      console.log(event.error);
    };

    
    // onresult: É executado toda vez que o usuário começa a falar, pegando a fala e transforando-a, em texto
    //faz uma transcrição de texto do que foi dito. 
    reconhecimento.onresult = function(event){ // O 'event' é um objeto SpeechRecognitionEvent.
      // Ele contém todas as linhas que capturamos até agora.

      // Defino a minha variavel interim_transcript como vazia
      var interim_transcript = ''; //interim_transcript: transcrição intermediária
      if(!pode_gravar){
        linhaDeComando.value =  event.results[event.resultIndex][0].transcript.toLowerCase();
      }

      if(event.results[event.resultIndex][0].transcript.toLowerCase().trim() == 'ativar assistente'){
        pode_gravar = true
        txtInfo.innerHTML = 'Registrando áudio na ata'
        txtMicro.innerHTML = 'Parar gravação.';
      }
      if(event.results[event.resultIndex][0].transcript.toLowerCase().trim() == 'pausar assistente'){
        pode_gravar = false
        txtMicro.innerHTML = 'Gravar';
        txtInfo.innerHTML  = 'Captando áudio em segundo plano.'
        // ativa o gif do gravador
        document.getElementById("fita").setAttribute('src','fita-estatica.png')
      }
      if(event.results[event.resultIndex][0].transcript.toLowerCase().trim() == 'salvar reunião'){
        pode_gravar = false
        linhaDeComando.value='' 
        notifica()

      }
      console.log(pode_gravar)


      if(pode_gravar){

        txtInfo.innerHTML = 'Gravando!';
        linhaDeComando.value= ''
        // ativa o gif do gravador
        document.getElementById("fita").setAttribute('src','fita.png')

        // Utilizo o for para concatenar os resultados da transcrição 
        for(var i = event.resultIndex; i < event.results.length; i++){
          // verifico se o parametro isFinal esta setado como true com isso identico se é o final captura
          console.log('index: ' + i + '---' + event.results[i][0].transcript)
            var transc = event.results[i][0].transcript.toString()
            transc = transc.substring(0,1).toUpperCase().concat(transc.substring(1));
            transcricao_audio += " " + transc  +'. '; 
              
         
          
          // Verifico qual das variaveis não esta vazia e atribuo ela na variavel resultado
          var resultado = transcricao_audio 
           
          //console.log(resultado)
          // Escrevo o resultado no campo da textarea
          document.getElementById('campotexto').innerHTML = resultado
        }
      }
    };

  }else{
    // Caso não o navegador não apresente suporte ao Speech API apresentamos a seguinte mensagem
    console.log('navegador não apresenta suporte a web speech api');
    // alert('Este navegador não apresenta suporte para essa funcionalidade ainda');
  }  
}, false);


function salvar(){
  //captura o texto
  let texto = document.getElementById("campotexto").value;

  //captura o titulo
  let titulo = document.getElementById("titulo").value;

  let txt_local = montaCabecalhoLocal();
  
  //Blob representa um objeto do tipo arquivo, com  dados brutos imutáveis.
  let blob = new Blob([txt_local, texto], //linha 4 
      { 
          type: "text/html; charset = utf-8"
       });
       
  // método do fileServer
  saveAs(blob, titulo + ".txt"); 
//parâmetos: [variavel a ser salva (geralmente do tipo blob), nome do arquivo criado, extensão do arquivo criado]
}


function notifica() {

  var txt = 'Antes de salvar dê um titulo para esta ata.'
  // Verifica se o browser suporta notificações
  if (!("Notification" in window)) {
    alert("Este browser não suporta notificações de Desktop");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification(txt);
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification(txt);
      }
    });
  }

  // At last, if the user has denied notifications, and you 
  // want to be respectful there is no need to bother them any more.
}
