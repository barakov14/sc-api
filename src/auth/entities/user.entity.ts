import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Rights } from '../dtos/dolibarrUserResponse.dto';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  dolibarrUserId: string;

  @Column({ nullable: true })
  pin: string

  @Column({ nullable: true })
  refresh_token: string;
  @Column({ nullable: true }) module: string;
  @Column() entity: string;
  @Column({ nullable: true }) import_key: string;
  @Column('text', { array: true, nullable: true }) array_options: string[];
  @Column({ nullable: true }) array_languages: string;
  @Column({ nullable: true }) contacts_ids: string;
  @Column({ nullable: true }) linkedObjectsIds: string;
  @Column({ nullable: true }) canvas: string;
  @Column({ nullable: true }) fk_project: string;
  @Column({ nullable: true }) contact_id: string;
  @Column({ nullable: true }) user: string;
  @Column({ nullable: true }) origin_type: string;
  @Column({ nullable: true }) origin_id: string;
  @Column() ref: string;
  @Column({ nullable: true }) ref_ext: string;
  @Column() statut: string;
  @Column() status: string;
  @Column({ nullable: true }) country_id: string;
  @Column() country_code: string;
  @Column({ nullable: true }) state_id: string;
  @Column({ nullable: true }) region_id: string;
  @Column({ nullable: true }) barcode_type: string;
  @Column({ nullable: true }) barcode_type_coder: string;
  @Column({ nullable: true }) mode_reglement_id: string;
  @Column({ nullable: true }) cond_reglement_id: string;
  @Column({ nullable: true }) demand_reason_id: string;
  @Column({ nullable: true }) transport_mode_id: string;
  @Column({ nullable: true }) shipping_method: string;
  @Column({ nullable: true }) fk_multicurrency: string;
  @Column({ nullable: true }) multicurrency_code: string;
  @Column({ nullable: true }) multicurrency_tx: string;
  @Column({ nullable: true, type: 'decimal' }) multicurrency_total_ht: number;
  @Column({ nullable: true, type: 'decimal' }) multicurrency_total_tva: number;
  @Column({ nullable: true, type: 'decimal' }) multicurrency_total_ttc: number;
  @Column({ nullable: true }) last_main_doc: string;
  @Column({ nullable: true }) fk_account: string;
  @Column({ nullable: true }) note_public: string;
  @Column({ nullable: true }) note_private: string;
  @Column({ nullable: true }) actiontypecode: string;
  @Column({ nullable: true }) name: string;
  @Column() lastname: string;
  @Column() firstname: string;
  @Column({ nullable: true }) civility_id: string;
  @CreateDateColumn({ type: 'timestamp', nullable: true })
  date_creation: Date | null;
  @Column({ type: 'timestamp', nullable: true })
  date_validation: Date | null;
  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  date_modification: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  date_cloture: Date | null;
  @Column({ nullable: true }) user_author: string;
  @Column({ nullable: true }) user_creation: string;
  @Column({ nullable: true }) user_valid: string;
  @Column({ nullable: true }) user_validation: string;
  @Column({ nullable: true }) user_closing_id: string;
  @Column({ nullable: true }) user_modification: string;
  @Column() specimen: number;
  @Column('text', { array: true, nullable: true }) extraparams: string[];
  @Column({ nullable: true }) employee: string;
  @Column() login: string;
  @Column({ nullable: true }) pass_crypted: string;
  @Column() datec: number;
  @Column() datem: number;
  @Column({ nullable: true }) socid: string;
  @Column({ nullable: true }) fk_member: string;
  @Column({ nullable: true }) fk_user: string;
  @Column({ nullable: true }) clicktodial_url: string;
  @Column({ nullable: true }) clicktodial_login: string;
  @Column({ type: 'timestamp', nullable: true })
  datelastlogin: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  datepreviouslogin: Date | null;
  @Column({nullable: true}) iplastlogin: string;
  @Column({nullable: true}) ippreviouslogin: string;
  @Column({ nullable: true }) photo: string;
  @Column({ nullable: true }) lang: string;
  @Column({ type: 'jsonb', nullable: true }) rights: Rights;
  @Column({ nullable: true }) user_group_list: string;
  @Column({ nullable: true }) conf: string;
  @Column({ nullable: true }) salary: number;
  @Column({ nullable: true }) salaryextra: number;
  @Column({ nullable: true }) weeklyhours: number;
  @Column({ nullable: true }) color: string;
  @Column({ type: 'timestamp', nullable: true })
  dateemployment: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  dateemploymentend: Date | null;
  @Column({ nullable: true }) address: string;
  @Column({ nullable: true }) zip: string;
  @Column({ nullable: true }) town: string;
}
