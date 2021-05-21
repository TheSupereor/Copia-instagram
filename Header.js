import {useEffect, useState} from 'react';
import firebase from 'firebase';
import {auth, storage, db, functions} from './firebase.js';
function Header(props){

    const [progress, setProgress] = useState(0);
    const [file, setFile] = useState(null);

    useEffect(() => {
      
    }, [])


    function criarConta(e){
        
        e.preventDefault();
        let email = document.getElementById('email-cadastro').value;
        let username = document.getElementById('username-cadastro').value;
        let senha = document.getElementById('senha-cadastro').value;

        //Criar conta firebase;
        auth.createUserWithEmailAndPassword(email,senha)
        .then((authUser)=>{
            authUser.user.updateProfile({
                displayName:username
            })
            alert('Conta criada com sucesso!');
            let modal = document.querySelector('.modalCriarConta');

              modal.style.display = "none";
        }).catch((error)=>{
          alert(error.message);
        })
        ;


    }

    //sistema de login
    function logar(e){
      e.preventDefault();
      let email = document.getElementById('email-login').value;
      let senha = document.getElementById('senha-login').value;

      //função do firebase pra logar com email e senha
      auth.signInWithEmailAndPassword(email,senha)
      .then((auth)=>{
        props.setUser(auth.user.displayName);
        alert('Logado com sucesso!');
        window.location.href = "/";
      }).catch((err)=>{
        alert(err.message);
      })

    }


    function abrirModalCriarConta(e){
      e.preventDefault();

      let modal = document.querySelector('.modalCriarConta');

      modal.style.display = "block";

     
    }

    function fecharModalCriar(){
      let modal = document.querySelector('.modalCriarConta');

      modal.style.display = "none";
    }

    function abrirModalUpload(e){
        e.preventDefault();

        let modal = document.querySelector('.modalUpload');

        modal.style.display = "block";
    }

    function fecharModalUpload(){
        //e.preventDefault();

        let modal = document.querySelector('.modalUpload');

        modal.style.display = "none";
    }

    function deslogar(e) {
        e.preventDefault();
        auth.signOut().then(function(val) {
            props.setUser(null);
            window.location.href = "/";
        })
    }

    function uploadPost(e){
        e.preventDefault();
        
        //pega o nome que é dado pra foto, pode ser repetido para colocar descrição
        if (document.getElementById('titulo-upload') != null){
          var tituloPost = document.getElementById('titulo-upload').value;
        } else {
          tituloPost = "";
        }

        //upload task vai colocar no firebase os dados selecionados, nesse caso a imagem
        const uploadTask = storage.ref(`images/${file.name}`).put(file);

        //muda o progresso da barra de progresso de envio
        uploadTask.on("state_changed", function(snapshot){
            const progress = Math.round(snapshot.bytesTransferred/snapshot.totalBytes) *100;
            setProgress(progress);
        }, function(error){

            //tendo tudo dado certo realiza:
        }, function(){
            storage.ref("images").child(file.name).getDownloadURL()
                .then(function(url){
                    db.collection('posts').add({
                        titulo: tituloPost,
                        image: url,
                        userName: props.user,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    })

                    setProgress(0);
                    setFile(null);

                    alert('Upload realizado com sucesso');

                    document.getElementById('formUpload').reset();
                    fecharModalUpload();
                })
        })
    }

    return (

<div className="header">

      <div className="modalCriarConta">
          <div className="formCriarConta">
            <div onClick={()=>fecharModalCriar()} className="close-modal-criar">X</div>
              <h2>Criar Conta</h2>
                <form onSubmit={(e)=>criarConta(e)}>
                    <input id="email-cadastro" type="text" placeholder="Seu e-mail..." />
                    <input id="username-cadastro" type="text" placeholder="Seu username..." />
                    <input id="senha-cadastro" type="password" placeholder="Sua senha..." />
                    <input type="submit" value="Criar Conta!" />
                </form>
          </div>
      </div>

      <div className="modalUpload">
          <div className="formUpload">
            <div onClick={()=>fecharModalUpload()} className="close-modal-criar">X</div>
              <h2>Fazer upload</h2>
                <form id="formUpload" onSubmit={(e)=>uploadPost(e)}>
                    <progress id="progress-upload" value ={progress}></progress>
                    <input id="titulo-upload" type="text" placeholder="Nome da sua foto" />
                    <input onChange={(e) => setFile(e.target.files[0])} type="file" name="file" />
                    <input type="submit" value="Enviar" />
                </form>
          </div>
      </div>


      <div className="center">
          <div className="header__logo">
              <a href=""><img src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" /></a>
          </div>
          {
            (props.user)?
            <div className="header__logadoInfo">
              <span>Olá, <b>{props.user}</b></span>
              <a onClick={(e)=>abrirModalUpload(e)} href="#">Postar!</a>
              <a onClick={(e)=>deslogar(e)}>Deslogar</a>
            </div>
            :
            <div className="header__loginForm">
              <form onSubmit={(e)=>logar(e)}>
                <input id="email-login" type="text" placeholder="Email" />
                <input id="senha-login" type="password" placeholder="Senha..." />
                <input type="submit" name="acao" value="Logar!" />
              </form>
              <div className="btn__criarConta">
                <a onClick={(e)=>abrirModalCriarConta(e)} href="#">Criar Conta!</a>
              </div>
          </div>
          }
          
          </div>
</div>

    )


}



export default Header;
