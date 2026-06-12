import type {
  BootstrapRepository,
  SessionRevoker,
  SettingsRepository,
  UserRepository
} from "@zellforce/application";
import type {
  AuthenticatedUser,
  CreateInternalUserInput,
  TenantSettings
} from "@zellforce/contracts";
import type { DbClient } from "@zellforce/db";

type UserRow = {
  id: string;
  auth_user_id: string;
  tenant_id: string;
  person_id: string | null;
  email: string;
  full_name: string;
  role: AuthenticatedUser["role"];
  is_active: boolean;
};

type SettingsRow = {
  default_language: TenantSettings["defaultLanguage"];
  supported_languages: TenantSettings["supportedLanguages"];
  timezone: string;
  currency: string;
  hijri_enabled: boolean;
};

const USER_COLUMNS =
  "id, auth_user_id, tenant_id, person_id, email, full_name, role, is_active";

export function createPgUserRepository(client: DbClient): UserRepository {
  return {
    async findByAuthUserId(authUserId) {
      const result = await client.query(
        `select ${USER_COLUMNS} from users where auth_user_id = $1`,
        [authUserId]
      );
      return mapOptionalUser(result.rows[0]);
    },

    async findById(tenantId, userId) {
      const result = await client.query(
        `select ${USER_COLUMNS} from users where tenant_id = $1 and id = $2`,
        [tenantId, userId]
      );
      return mapOptionalUser(result.rows[0]);
    },

    async listByTenant(tenantId) {
      const result = await client.query(
        `select ${USER_COLUMNS} from users where tenant_id = $1 order by full_name`,
        [tenantId]
      );
      return result.rows.map(mapUser);
    },

    async create(
      tenantId: string,
      input: Omit<CreateInternalUserInput, "password">,
      authUserId: string
    ) {
      const result = await client.query(
        `
          insert into users (
            tenant_id, person_id, auth_user_id, email, full_name, role, is_active
          )
          values ($1, $2, $3, $4, $5, $6, $7)
          returning ${USER_COLUMNS}
        `,
        [
          tenantId,
          input.personId,
          authUserId,
          input.email,
          input.fullName,
          input.role,
          input.isActive
        ]
      );
      return mapUser(result.rows[0]);
    },

    async setActive(tenantId, userId, isActive) {
      const result = await client.query(
        `
          update users set is_active = $3
          where tenant_id = $1 and id = $2
          returning ${USER_COLUMNS}
        `,
        [tenantId, userId, isActive]
      );
      return mapRequiredUser(result.rows[0]);
    },

    async linkPerson(tenantId, userId, personId) {
      const result = await client.query(
        `
          update users set person_id = $3
          where tenant_id = $1 and id = $2
          returning ${USER_COLUMNS}
        `,
        [tenantId, userId, personId]
      );
      return mapRequiredUser(result.rows[0]);
    },

    async personBelongsToTenant(tenantId, personId) {
      const result = await client.query(
        "select 1 from persons where tenant_id = $1 and id = $2",
        [tenantId, personId]
      );
      return result.rowCount === 1;
    },

    async countActiveOwners(tenantId) {
      const result = await client.query(
        `
          select count(*)::integer as count
          from users
          where tenant_id = $1 and role = 'owner' and is_active = true
        `,
        [tenantId]
      );
      return Number((result.rows[0] as { count?: number } | undefined)?.count ?? 0);
    },

    async writeAudit(input) {
      await client.query(
        `
          insert into audit_logs (
            tenant_id, actor_user_id, action, entity_type, entity_id,
            before_data, after_data
          )
          values ($1, $2, $3, 'user', $4, $5, $6)
        `,
        [
          input.tenantId,
          input.actorUserId,
          input.action,
          input.entityId,
          JSON.stringify(input.before),
          JSON.stringify(input.after)
        ]
      );
    }
  };
}

export function createPgSettingsRepository(client: DbClient): SettingsRepository {
  return {
    async get(tenantId) {
      const result = await client.query(
        `
          select default_language, supported_languages, timezone, currency, hijri_enabled
          from tenant_settings
          where tenant_id = $1
        `,
        [tenantId]
      );
      return mapSettings(result.rows[0]);
    },

    async update(tenantId, settings) {
      const result = await client.query(
        `
          update tenant_settings
          set default_language = $2,
              supported_languages = $3,
              timezone = $4,
              currency = $5,
              hijri_enabled = $6
          where tenant_id = $1
          returning default_language, supported_languages, timezone, currency, hijri_enabled
        `,
        [
          tenantId,
          settings.defaultLanguage,
          settings.supportedLanguages,
          settings.timezone,
          settings.currency,
          settings.hijriEnabled
        ]
      );
      return mapSettings(result.rows[0]);
    },

    async writeAudit(input) {
      await client.query(
        `
          insert into audit_logs (
            tenant_id, actor_user_id, action, entity_type, entity_id,
            before_data, after_data
          )
          values ($1, $2, 'tenant.settings.updated', 'tenant', $1, $3, $4)
        `,
        [
          input.tenantId,
          input.actorUserId,
          JSON.stringify(input.before),
          JSON.stringify(input.after)
        ]
      );
    }
  };
}

export function createSessionRevoker(client: DbClient): SessionRevoker {
  return {
    async revokeAllForIdentity(authUserId) {
      await client.query('delete from session where "userId" = $1', [authUserId]);
    }
  };
}

export function createPgBootstrapRepository(client: DbClient): BootstrapRepository {
  return {
    async findTenantIdBySlug(slug) {
      const result = await client.query(
        "select id from tenants where slug = $1",
        [slug]
      );
      return (result.rows[0] as { id?: string } | undefined)?.id ?? null;
    },

    async countUsers(tenantId) {
      const result = await client.query(
        "select count(*)::integer as count from users where tenant_id = $1",
        [tenantId]
      );
      return Number((result.rows[0] as { count?: number } | undefined)?.count ?? 0);
    },

    async ensureTenantSettings(tenantId) {
      await client.query(
        `
          insert into tenant_settings (tenant_id)
          values ($1)
          on conflict (tenant_id) do nothing
        `,
        [tenantId]
      );
    }
  };
}

function mapOptionalUser(row: unknown): AuthenticatedUser | null {
  return row ? mapUser(row) : null;
}

function mapRequiredUser(row: unknown): AuthenticatedUser {
  if (!row) {
    throw new Error("User not found");
  }
  return mapUser(row);
}

function mapUser(value: unknown): AuthenticatedUser {
  const row = value as UserRow;
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    tenantId: row.tenant_id,
    personId: row.person_id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    isActive: row.is_active
  };
}

function mapSettings(value: unknown): TenantSettings {
  if (!value) {
    throw new Error("Tenant settings not found");
  }
  const row = value as SettingsRow;
  return {
    defaultLanguage: row.default_language,
    supportedLanguages: row.supported_languages,
    timezone: row.timezone,
    currency: row.currency,
    hijriEnabled: row.hijri_enabled
  };
}
