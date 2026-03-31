"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { styles } from "@/components/styles";

export default function Unauthorized() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/tester");
  };

  return (
    <div className={styles.container.authPage}>
      <div className={styles.container.authCard}>
        <h1 className={styles.text.authHeading}>Sign in</h1>
        {error && <p className={styles.text.authError}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.layout.authForm}>
          <label className="block">
            <span className={styles.label.base}>Email</span>
            <input
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
              className={styles.input.auth}
            />
          </label>

          <label className="block">
            <span className={styles.label.base}>Password</span>
            <input
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
              className={styles.input.auth}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className={styles.button.auth}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
