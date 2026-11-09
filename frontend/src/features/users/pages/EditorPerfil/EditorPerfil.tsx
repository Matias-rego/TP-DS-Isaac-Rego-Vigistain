import styles from "./EditorPerfil.module.css";
import { useCallback, useEffect, useState } from "react";
import Nav from "@/components/layout/Nav/Nav";
import type { User } from "@/features/users/types";
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle, DialogPortal } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import ActionButton from "@/components/Common/Buttons/ActionButton";
import { api, getFieldErrors, notifyIfNeeded } from "@/api/client";
import { notifier } from "@/notifications/notifier";
import { useAuth } from "@/lib/AuthContext";
import { uploadFoto } from "@/lib/upload";

const EditorPerfil = () => {
  const { refetchUser } = useAuth();

  const [usuario, setUsuario] = useState<User | null>(null);
  const [form, setForm] = useState({ userName: "", email: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [modalPic, setModalPic] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [foto, setFoto] = useState<File | null>(null);

  const [showForgot, setShowForgot] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>("");
  const [resetEmailError, setResetEmailError] = useState<string | null>(null);
  const [resetSubmitting, setResetSubmitting] = useState<boolean>(false);

  const loadProfile = useCallback(async () => {
    try {
      const data = await api<User>("/api/auth/me");
      setUsuario(data);
      setForm({ userName: data.userName, email: data.email });
    } catch (e) {
      notifyIfNeeded(e, "No se pudo cargar el perfil");
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPreview(null);
    setFoto(null);
  };

  const handleSaveChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!usuario) return;

    setFieldErrors({});
    setSaving(true);

    try {
      let urlPicture = usuario.urlPicture;

      if (foto) {
        const uploadResult = await uploadFoto(foto);
        urlPicture = uploadResult.url;
      }

      await api(`/api/users/${usuario.id_user}`, {
        method: "PUT",
        body: JSON.stringify({
          userName: form.userName.trim(),
          email: form.email.trim(),
          urlPicture,
        }),
        silent: true,
      });

      notifier.success("Perfil actualizado correctamente");
      setFoto(null);
      setPreview(null);

      await loadProfile();
      await refetchUser();
    } catch (e) {
      const errors = getFieldErrors(e);

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);

        // Errores de campos que no tienen input en esta pantalla (ej: la foto)
        const unmatched = Object.entries(errors).filter(
          ([name]) => name !== "userName" && name !== "email",
        );
        if (unmatched.length > 0) {
          notifier.error(unmatched.map(([, msg]) => msg).join(". "));
        }
      } else {
        notifyIfNeeded(e, e instanceof Error ? e.message : "No se pudieron guardar los cambios");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleForgotSubmit = async () => {
    if (!/^\S+@\S+\.\S+$/.test(resetEmail.trim())) {
      setResetEmailError("Ingresá un email válido");
      return;
    }
    setResetEmailError(null);

    setResetSubmitting(true);
    try {
      await api("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: resetEmail.trim() }),
      });

      notifier.success("Si el email existe, te enviamos un link para restablecer tu contraseña.");
      setResetEmail("");
      setShowForgot(false);
    } catch (e) {
      notifyIfNeeded(e, "No pudimos procesar la solicitud");
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <><Nav />
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Edicion de Perfil</h1>
          <form onSubmit={handleSaveChanges}>
            <div className={styles.cardForm}>
              <div className={styles.group}>
                <label className={styles.subtitle}>Foto de perfil</label>
                <img
                  src={preview ?? usuario?.urlPicture}
                  alt={usuario?.userName}
                  className={styles.avatarRoot}
                />
                <button type="button" className={styles.button2} onClick={() => setModalPic(true)}>
                  Cambiar foto
                </button>
              </div>
            </div>

            <Dialog open={modalPic} onOpenChange={setModalPic}>
              <DialogPortal>
                <DialogContent className={styles.dialogContent} showCloseButton={false}>
                  <DialogHeader className={styles.dialog}>
                    <DialogTitle>Cambiar foto de perfil</DialogTitle>

                    <VisuallyHidden>
                      <DialogDescription>
                        Seleccioná una imagen para actualizar tu foto de perfil
                      </DialogDescription>
                    </VisuallyHidden>
                  </DialogHeader>

                  <div className={styles.group}>
                    <label className={styles.label} style={{ textAlign: "center" }}>
                      Foto de perfil
                    </label>

                    {preview ? (
                      <div className={styles.previewWrap}>
                        <img
                          src={preview}
                          alt="Preview"
                          className={styles.preview}
                        />

                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={removePhoto}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label
                        className={styles.dropZone}
                        htmlFor="file-input"
                      >
                        <span className={styles.dropZoneIcon}>📷</span>

                        <span className={styles.dropZoneText}>
                          Hacé clic para subir una imagen
                        </span>
                      </label>
                    )}

                    <input
                      type="file"
                      id="file-input"
                      className={styles.fileInput}
                      onChange={handleFoto}
                    />
                  </div>
                </DialogContent>
              </DialogPortal>
            </Dialog>

            <div className={styles.cardForm}>
              <div className={styles.group}>
                <label className={styles.subtitle} style={{ fontSize: "1.2rem" }}>
                  Datos personales
                </label>

                <label className={styles.label} htmlFor="userName">Nombre de usuario</label>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  className={styles.input}
                  value={form.userName}
                  onChange={handleChange}
                  disabled={saving}
                />
                {fieldErrors.userName && (
                  <span className={styles.errorText}>{fieldErrors.userName}</span>
                )}

                <label className={styles.label} htmlFor="email">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={styles.input}
                  value={form.email}
                  onChange={handleChange}
                  disabled={saving}
                />
                {fieldErrors.email && (
                  <span className={styles.errorText}>{fieldErrors.email}</span>
                )}

                {!showForgot ? (
                  <ActionButton
                    label="Modificar contraseña"
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowForgot(true);
                      setResetEmailError(null);
                    }}
                  />
                ) : (
                  <div className={styles.group}>
                    <label htmlFor="resetEmail" className={styles.label}>
                      Confirmá tu email para restablecer la contraseña
                    </label>
                    <input
                      type="email"
                      id="resetEmail"
                      className={styles.input}
                      placeholder="tu@email.com"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        setResetEmailError(null);
                      }}
                    />
                    {resetEmailError && (
                      <span className={styles.errorText}>{resetEmailError}</span>
                    )}

                    <button
                      type="button"
                      className={styles.button}
                      disabled={resetSubmitting}
                      onClick={handleForgotSubmit}
                    >
                      {resetSubmitting ? "Enviando…" : "Enviar link de recuperación"}
                    </button>

                    <ActionButton
                      label="← Cancelar"
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowForgot(false);
                        setResetEmail("");
                        setResetEmailError(null);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <Button
              className={styles.button2}
              style={{ marginTop: "20px" }}
              type="submit"
              disabled={saving || !usuario}
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditorPerfil;