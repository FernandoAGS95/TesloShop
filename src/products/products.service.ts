import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    //Al inyectar de esta manera el DatasoURCE, EL SABRA A QUE bbdd ME CONECTO a que usario, todas las variables de conexion
    private readonly dataSource: DataSource
  ) {

  }

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const producto = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({ url: image }))
      });

      await this.productRepository.save(producto);

      return { ...producto, images }

    } catch (error) {
      this.handleDBExceptins(error)
    }


  }
  //Como images no es una columna, al momento de hacer un finAll estas no se traen:w, por lo cual hayq ue definir las relaciones que se quieren mostrar
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto
    return this.productRepository.find({
      take: limit,
      skip: offset,
      //TODO: relaciones
      relations: {
        images: true,
      }

    })
  }

  async findAllAplanado(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      }
    });

    return products.map(product => ({
      ...product,
      images: product.images.map(img => img.url)
    }))
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      //product = await this.productRepository.findOneBy({ slug: term });
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder.where(`UPPER(title) =:title or slug =:slug`, { title: term.toUpperCase(), slug: term.toLowerCase() })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne()

    }
    // const product = await this.productRepository.findOneBy({ term });

    if (!product)
      throw new NotFoundException(`Product with id ${term} not found`)
    return product
  }
  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map(images => images.url)

    }

  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdate } = updateProductDto;
    const product = await this.productRepository.preload({ id, ...toUpdate });

    if (!product) throw new NotFoundException(`Product with id: ${id} not found`)

    //CREATEQUERYRUNNER la idea de usar el queryRunner es crear una transaccion de una BBDD que sin no se cumple alguno de los procesos, se hara un rollback yse cancelara el commit
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();


    try {
      if (images) {
        //Tenemos delete y softdelete, el delete realmente borra y el softDelete solo indica que no se debe ver
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map(image => this.productImageRepository.create({ url: image }))
      } else {
        ///TODO en caso de que no modifiquen imagenes

      }

      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();
      //      await this.productRepository.save(product)
      return this.findOnePlain(id)
    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptins(error)
    }

  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product)


  }

  private handleDBExceptins(error: any) {

    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);

    throw new InternalServerErrorException('unexpected errorm check server log')
  }


  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {

      return await query
        .delete()
        .where({})
        .execute();
    } catch (error) {
      this.handleDBExceptins(error);
    }
  }
}
