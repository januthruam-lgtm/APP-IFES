/**
 * Brain Studio - Serviço Central de Autenticação Segura (Firebase Auth & Firestore)
 * Permite cadastro com e-mail e senha, login, logout, redefinição de senha e persistência segura do perfil.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  User as FirebaseUser,
  UserCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { UserProfile, IfesAccountInfo } from "../types";
import { createBlankUser, INITIAL_USER } from "../data/initialData";

/**
 * Traduz códigos de erro do Firebase Auth para mensagens amigáveis em português.
 */
export function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "Este e-mail já está cadastrado. Acesse a aba de login ou redefina sua senha.";
    case "auth/invalid-email":
      return "O formato do e-mail informado é inválido.";
    case "auth/operation-not-allowed":
      return "O método de autenticação está temporariamente desativado no sistema.";
    case "auth/weak-password":
      return "A senha é muito fraca. Digite pelo menos 6 caracteres.";
    case "auth/user-disabled":
      return "Esta conta foi suspensa temporariamente. Entre em contato com o suporte.";
    case "auth/user-not-found":
      return "Nenhuma conta cadastrada com este e-mail. Verifique a digitação ou cadastre-se.";
    case "auth/wrong-password":
      return "Senha incorreta. Verifique os caracteres e tente novamente.";
    case "auth/invalid-credential":
      return "E-mail ou senha incorretos. Verifique suas credenciais.";
    case "auth/too-many-requests":
      return "Muitas tentativas consecutivas. Aguarde alguns minutos antes de tentar novamente.";
    case "auth/network-request-failed":
      return "Falha de conexão com a internet. Verifique sua rede e tente novamente.";
    case "auth/popup-closed-by-user":
      return "A janela de login com o Google foi fechada antes de concluir. Tente novamente.";
    case "auth/popup-blocked":
      return "A janela pop-up foi bloqueada pelo navegador. Permita pop-ups para fazer login com o Google.";
    case "auth/cancelled-popup-request":
      return "A solicitação de login com o Google foi substituída ou cancelada.";
    case "auth/account-exists-with-different-credential":
      return "Já existe uma conta cadastrada com este e-mail usando outro método de acesso.";
    case "auth/unauthorized-domain":
      return "Domínio não autorizado no Firebase Authentication Console.";
    default:
      return "Ocorreu um erro na autenticação. Tente novamente mais tarde.";
  }
}

/**
 * Envia e-mail de confirmação direto para a conta do usuário (Firebase Auth + auditoria no servidor).
 */
export async function enviarConfirmacaoPorEmail(
  fbUser: FirebaseUser
): Promise<{ sent: boolean; message: string }> {
  if (!fbUser || !fbUser.email) {
    return { sent: false, message: "E-mail do usuário não disponível para envio." };
  }

  let sent = false;
  let message = "";

  // 1. Dispara e-mail de verificação oficial através do Firebase Authentication
  try {
    await sendEmailVerification(fbUser);
    sent = true;
    message = `E-mail de confirmação enviado para ${fbUser.email}. Verifique sua caixa de entrada e spam.`;
  } catch (err: any) {
    if (err?.code === "auth/too-many-requests") {
      sent = true;
      message = `Um e-mail de confirmação recente já foi enviado para ${fbUser.email}. Verifique sua caixa de entrada.`;
    } else {
      console.warn("Aviso ao disparar sendEmailVerification no Firebase:", err);
      sent = false;
      message = `Confirmação registrada para ${fbUser.email}.`;
    }
  }

  // 2. Dispara registro de auditoria no servidor
  try {
    await fetch("/api/auth/send-confirmation-notice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fbUser.email,
        name: fbUser.displayName || "Estudante",
        provider: fbUser.providerData?.[0]?.providerId || "auth",
        timestamp: Date.now(),
      }),
    });
  } catch (fetchErr) {
    console.warn("Aviso ao notificar servidor sobre confirmação:", fetchErr);
  }

  return { sent, message };
}

/**
 * Cadastra um novo usuário no Firebase Auth e cria seu perfil seguro no Firestore (users/{uid}).
 */
export async function cadastrarComEmailESenha(
  email: string,
  senha: string,
  nome: string
): Promise<{
  user: FirebaseUser;
  profile: UserProfile;
  confirmationSent: boolean;
  confirmationMessage: string;
}> {
  const cleanEmail = email.trim();
  const cleanNome = nome.trim();

  // 1. Cria credencial no Firebase Authentication
  const userCredential: UserCredential = await createUserWithEmailAndPassword(
    auth,
    cleanEmail,
    senha
  );
  const fbUser = userCredential.user;

  // 2. Define o nome de exibição no Firebase User Profile
  if (cleanNome) {
    try {
      await updateProfile(fbUser, { displayName: cleanNome });
    } catch (e) {
      console.warn("Aviso ao definir displayName no Firebase Auth:", e);
    }
  }

  // 3. Dispara envio direto do e-mail de confirmação
  const confirmation = await enviarConfirmacaoPorEmail(fbUser);

  // 4. Constrói o perfil inicial completo e seguro do estudante
  const novoPerfil: UserProfile = {
    ...createBlankUser(cleanNome || "Estudante", cleanEmail),
    id: fbUser.uid,
    uid: fbUser.uid,
    name: cleanNome || "Estudante",
    email: cleanEmail,
    level: 1,
    xp: 0,
    coins: 250,
    energy: 50,
    maxEnergy: 50,
    streakDays: 1,
  };

  // 5. Salva documento seguro no Firestore na coleção users/{uid}
  try {
    const userDocRef = doc(db, "users", fbUser.uid);
    await setDoc(
      userDocRef,
      {
        ...novoPerfil,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
        provedor: "password",
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Aviso ao salvar perfil inicial no Firestore:", err);
  }

  // Salva no LocalStorage para acesso offline e sincronização rápida
  try {
    localStorage.setItem("brain_studio_user_v3", JSON.stringify(novoPerfil));
    localStorage.setItem("brain_studio_is_logged_in", "true");
  } catch {}

  return {
    user: fbUser,
    profile: novoPerfil,
    confirmationSent: confirmation.sent,
    confirmationMessage: confirmation.message,
  };
}

/**
 * Realiza login com e-mail e senha no Firebase Auth e carrega os dados seguros do Firestore.
 */
export async function entrarComEmailESenha(
  email: string,
  senha: string
): Promise<{
  user: FirebaseUser;
  profile: UserProfile;
  confirmationSent: boolean;
  confirmationMessage: string;
}> {
  const cleanEmail = email.trim();

  // 1. Autentica no Firebase Auth
  const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, senha);
  const fbUser = userCredential.user;

  // 2. Dispara envio direto do e-mail de confirmação
  const confirmation = await enviarConfirmacaoPorEmail(fbUser);

  // 3. Busca perfil seguro do Firestore em users/{uid}
  let perfil: UserProfile | null = null;
  try {
    const userDocRef = doc(db, "users", fbUser.uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      perfil = {
        ...(snap.data() as UserProfile),
        id: fbUser.uid,
        uid: fbUser.uid,
        email: fbUser.email || cleanEmail,
      };
      await setDoc(
        userDocRef,
        {
          ...perfil,
          ultimoAcessoEm: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn("Aviso ao ler perfil do Firestore durante login:", err);
  }

  // Fallback caso seja o primeiro acesso ou sem documento salvo no Firestore
  if (!perfil) {
    perfil = {
      ...createBlankUser(fbUser.displayName || "Estudante", cleanEmail),
      id: fbUser.uid,
      uid: fbUser.uid,
      name: fbUser.displayName || "Estudante",
      email: cleanEmail,
    };
    try {
      const userDocRef = doc(db, "users", fbUser.uid);
      await setDoc(userDocRef, perfil, { merge: true });
    } catch {}
  }

  // Persiste sessão local
  try {
    localStorage.setItem("brain_studio_user_v3", JSON.stringify(perfil));
    localStorage.setItem("brain_studio_is_logged_in", "true");
  } catch {}

  return {
    user: fbUser,
    profile: perfil,
    confirmationSent: confirmation.sent,
    confirmationMessage: confirmation.message,
  };
}

/**
 * Conecta e autentica o usuário via Conta Google (Firebase GoogleAuthProvider).
 * Cria ou atualiza o perfil em users/{uid} e dispara e-mail de confirmação direto para a conta do usuário.
 */
export async function entrarComGoogle(): Promise<{
  user: FirebaseUser;
  profile: UserProfile;
  confirmationSent: boolean;
  confirmationMessage: string;
}> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const userCredential = await signInWithPopup(auth, provider);
  const fbUser = userCredential.user;

  // 1. Dispara envio direto do e-mail de confirmação
  const confirmation = await enviarConfirmacaoPorEmail(fbUser);

  // 2. Busca ou cria perfil seguro no Firestore em users/{uid}
  let perfil: UserProfile | null = null;
  const userDocRef = doc(db, "users", fbUser.uid);
  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const dados = snap.data() as UserProfile;
      perfil = {
        ...dados,
        id: fbUser.uid,
        uid: fbUser.uid,
        name: fbUser.displayName || dados.name || "Estudante",
        email: fbUser.email || dados.email || "",
        avatar: fbUser.photoURL || dados.avatar,
      };
      await setDoc(
        userDocRef,
        {
          ...perfil,
          ultimoAcessoEm: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn("Aviso ao ler perfil do Firestore durante login Google:", err);
  }

  if (!perfil) {
    const studentName = fbUser.displayName || "Estudante";
    const studentEmail = fbUser.email || "";
    perfil = {
      ...createBlankUser(studentName, studentEmail),
      id: fbUser.uid,
      uid: fbUser.uid,
      name: studentName,
      email: studentEmail,
      avatar: fbUser.photoURL || undefined,
      level: 1,
      xp: 0,
      coins: 250,
      energy: 50,
      maxEnergy: 50,
      streakDays: 1,
    };
    try {
      await setDoc(
        userDocRef,
        {
          ...perfil,
          criadoEm: serverTimestamp(),
          ultimoAcessoEm: serverTimestamp(),
          provedor: "google.com",
        },
        { merge: true }
      );
    } catch (saveErr) {
      console.warn("Aviso ao salvar perfil inicial Google no Firestore:", saveErr);
    }
  }

  // Persiste sessão local
  try {
    localStorage.setItem("brain_studio_user_v3", JSON.stringify(perfil));
    localStorage.setItem("brain_studio_is_logged_in", "true");
  } catch {}

  return {
    user: fbUser,
    profile: perfil!,
    confirmationSent: confirmation.sent,
    confirmationMessage: confirmation.message,
  };
}

/**
 * Envia e-mail de redefinição de senha através do Firebase Auth.
 */
export async function enviarEmailRecuperacaoSenha(email: string): Promise<void> {
  const cleanEmail = email.trim();
  await sendPasswordResetEmail(auth, cleanEmail);
}

/**
 * Desconecta a sessão do usuário de forma segura no Firebase Auth e limpa caches locais.
 */
export async function desconectarUsuario(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn("Aviso ao efetuar signOut no Firebase Auth:", err);
  }

  try {
    localStorage.removeItem("brain_studio_is_logged_in");
    localStorage.removeItem("brain_studio_user_v3");
    localStorage.removeItem("brain_studio_moodle_creds_v2");
    localStorage.removeItem("brain_studio_ava_status_v2");
    sessionStorage.clear();
  } catch {}
}

/**
 * Escuta mudanças de estado da autenticação em tempo real.
 */
export function monitorarEstadoAutenticacao(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Retorna o usuário autenticado atual do Firebase Auth.
 */
export function obterUsuarioAtual(): FirebaseUser | null {
  return auth.currentUser;
}
