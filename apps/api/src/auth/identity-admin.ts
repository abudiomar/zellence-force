import type { IdentityAdmin } from "@zellforce/application";
import type { DbClient } from "@zellforce/db";

type IdentityProvisioner = {
  api: {
    signUpEmail(input: {
      body: { name: string; email: string; password: string };
    }): Promise<{ user: { id: string } }>;
  };
};

export function createIdentityAdmin(
  provisioner: IdentityProvisioner,
  client: DbClient
): IdentityAdmin {
  return {
    async createIdentity(input) {
      const result = await provisioner.api.signUpEmail({
        body: {
          name: input.name,
          email: input.email,
          password: input.password
        }
      });
      return { authUserId: result.user.id };
    },

    async deleteIdentity(authUserId) {
      await client.query('delete from "user" where id = $1', [authUserId]);
    }
  };
}
