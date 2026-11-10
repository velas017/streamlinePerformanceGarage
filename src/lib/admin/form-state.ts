/**
 * What every admin form's server action returns (useActionState). Lives here,
 * not beside the actions: a "use server" file may export only async functions
 * (CLAUDE.md §10).
 */
export type AdminFormState =
  | { readonly status: "idle" }
  | {
      readonly status: "error";
      readonly message: string;
      readonly fieldErrors?: Readonly<Record<string, string>>;
      /** Non-secret fields to keep filled in (never a password or a code). */
      readonly values?: Readonly<Record<string, string>>;
    }
  | {
      readonly status: "success";
      readonly message: string;
      /** Newly created backup codes, shown once. */
      readonly codes?: readonly string[];
    };

export const idleFormState: AdminFormState = { status: "idle" };

export type AdminFormAction = (
  state: AdminFormState,
  formData: FormData,
) => Promise<AdminFormState>;
