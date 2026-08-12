import db from '../../config/db';

export interface StaffRecord {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export class AuthRepository {
  public async findByEmail(email: string, excludeId?: number): Promise<StaffRecord | undefined> {
    const query = db<StaffRecord>('staff').where({ email });
    if (excludeId) {
      query.andWhereNot('id', excludeId);
    }
    return query.first();
  }

  public async findById(id: number): Promise<StaffRecord | undefined> {
    return db<StaffRecord>('staff').where({ id }).first();
  }

  public async create(data: Partial<StaffRecord>): Promise<StaffRecord> {
    const [staff] = await db<StaffRecord>('staff')
      .insert(data)
      .returning('*');
    return staff;
  }

  public async update(id: number, data: Partial<StaffRecord>): Promise<StaffRecord | undefined> {
    const [updated] = await db<StaffRecord>('staff')
      .where({ id })
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning('*');
    return updated;
  }

  public async delete(id: number): Promise<boolean> {
    const affected = await db('staff').where({ id }).del();
    return affected > 0;
  }
}
