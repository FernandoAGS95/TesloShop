import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./";

@Entity()
export class Product {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  title: string;

  @Column('float', {
    default: 0
  })
  price: number;
  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "text", unique: true })
  slug?: string;

  @Column('numeric', { default: 0 })
  stock: number


  @Column({ type: 'text', array: true })
  sizes: string[];


  @Column('text')
  gender: string

  @Column(
    'text', {
    array: true,
    default: []
  }
  )
  tags: string[];


  //images las relaciones Usualmente cascade no se usa mas que nada se bloquea la visibilidad para no perder la relacion
  //Al utilizar eager estamos haciendo que nuestro query select actue como si tuviera un leftJoin conectandolo con sus tablas relacionadas que tengan true en egaer
  @OneToMany(
    () => ProductImage,
    (productImage) => productImage.product,
    { cascade: true, eager: true }
  )
  images?: ProductImage[];

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;

    }
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '')
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '')
  }

}
