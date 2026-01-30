
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserRole } from 'secure-task-management-system/data';

@Entity('organizations')
export class OrganizationEntity {
        @PrimaryGeneratedColumn('uuid')
        id!: string;

        @Column()
        name!: string;

        @Column({ nullable: true })
        parentId?: string;

        @ManyToOne(() => OrganizationEntity, (org) => org.children, { nullable: true })
        parent?: OrganizationEntity;

        @OneToMany(() => OrganizationEntity, (org) => org.parent)
        children!: OrganizationEntity[];

        @OneToMany(() => UserEntity, (user) => user.organization)
        users!: UserEntity[];
}

@Entity('users')
export class UserEntity {
        @PrimaryGeneratedColumn('uuid')
        id!: string;

        @Column({ unique: true })
        username!: string;

        @Column({ select: false })
        password!: string;

        @Column({ type: 'varchar', default: UserRole.VIEWER })
        role!: UserRole;

        @Column()
        orgId!: string;

        @ManyToOne(() => OrganizationEntity, (org) => org.users)
        organization!: OrganizationEntity;

        @OneToMany(() => TaskEntity, (task) => task.owner)
        tasks!: TaskEntity[];
}

@Entity('tasks')
export class TaskEntity {
        @PrimaryGeneratedColumn('uuid')
        id!: string;

        @Column()
        title!: string;

        @Column('text')
        description!: string;

        @Column({ default: 'Todo' })
        status!: string;

        @Column({ default: 'Work' })
        category!: string;

        @Column()
        ownerId!: string;

        @Column()
        orgId!: string;

        @Column({ default: 0 })
        order!: number;

        @ManyToOne(() => UserEntity, (user) => user.tasks)
        owner!: UserEntity;

        @CreateDateColumn()
        createdAt!: Date;

        @UpdateDateColumn()
        updatedAt!: Date;
}

@Entity('audit_logs')
export class AuditLogEntity {
        @PrimaryGeneratedColumn('uuid')
        id!: string;

        @Column()
        action!: string;

        @Column()
        userId!: string;

        @Column()
        resource!: string;

        @Column({ nullable: true })
        resourceId?: string;

        @Column({ type: 'text', nullable: true })
        details?: string;

        @CreateDateColumn()
        timestamp!: Date;
}
