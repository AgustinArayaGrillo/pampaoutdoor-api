import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './categories/category.entity';
import { Product } from './products/product.entity';
import { User, UserRole } from './users/user.entity';
import * as bcrypt from 'bcrypt';

const CATEGORIES = [
  { name: 'Camperas', slug: 'camperas', description: 'Camperas y abrigos técnicos' },
  { name: 'Pesca', slug: 'pesca', description: 'Indumentaria y accesorios de pesca' },
  { name: 'Calzado', slug: 'calzado', description: 'Botas, zapatillas y sandalias outdoor' },
  { name: 'Accesorios', slug: 'accesorios', description: 'Mochilas, gorras y accesorios' },
];

const PRODUCTS_DATA = [
  { name: 'Campera Softshell Mujer Vinson', brand: 'Ansilta', categorySlug: 'camperas', subcategory: 'softshell', price: 89900, oldPrice: 112000, badge: 'Sale', badgeType: 'sale', sizes: ['XS','S','M','L','XL'], colors: ['Negro','Rojo','Gris'], image: 'https://images.unsplash.com/flagged/photo-1595712137256-35a05bff0d9e?w=500&q=80', featured: true, description: 'Campera softshell técnica para montaña. Resistente al viento y agua, ideal para actividades de alta montaña.', stock: 15 },
  { name: 'Campera Pluma Down 700 Fill', brand: 'Ansilta', categorySlug: 'camperas', subcategory: 'pluma', price: 178000, oldPrice: null, badge: 'Nuevo', badgeType: 'new', sizes: ['XS','S','M','L','XL','XXL'], colors: ['Negro','Naranja','Azul'], image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80', featured: true, description: 'Campera de pluma con relleno 700 fill. Ultraliviana y compactable, máximo abrigo para bajas temperaturas.', stock: 8 },
  { name: 'Campera Impermeable Omni-Tech', brand: 'Columbia', categorySlug: 'camperas', subcategory: 'hardshell', price: 145000, oldPrice: 175000, badge: 'Sale', badgeType: 'sale', sizes: ['S','M','L','XL','XXL'], colors: ['Verde Oliva','Negro','Azul Marino'], image: 'https://images.unsplash.com/photo-1548883354-d056ab7b441f?w=500&q=80', featured: true, description: 'Campera impermeable con tecnología Omni-Tech. Sellado de costuras, capucha ajustable.', stock: 12 },
  { name: 'Polar Fleece Synchilla', brand: 'Patagonia', categorySlug: 'camperas', subcategory: 'polar', price: 78000, oldPrice: null, badge: null, badgeType: null, sizes: ['XS','S','M','L','XL'], colors: ['Gris','Azul Marino','Verde'], image: 'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=500&q=80', featured: true, description: 'Polar clásico Synchilla de Patagonia. Tela suave y abrigada, ideal como capa intermedia.', stock: 20 },
  { name: 'Wader Neoprene 5mm Caña Alta', brand: 'Trevo', categorySlug: 'pesca', subcategory: 'ropa-pesca', price: 118000, oldPrice: null, badge: 'Nuevo', badgeType: 'new', sizes: ['M','L','XL','XXL'], colors: ['Caqui','Verde'], image: 'https://images.unsplash.com/photo-1545450660-3378a7f3a364?w=500&q=80', featured: true, description: 'Wader de neoprene 5mm con bota integrada de goma. Ideal para pesca en ríos de aguas frías.', stock: 6 },
  { name: 'Chaleco Pesca Multifunción Pro', brand: 'Trevo', categorySlug: 'pesca', subcategory: 'accesorios-pesca', price: 52000, oldPrice: null, badge: null, badgeType: null, sizes: ['M','L','XL','XXL'], colors: ['Verde Oliva','Gris'], image: 'https://images.unsplash.com/photo-1566528226211-090651acf06c?w=500&q=80', featured: true, description: 'Chaleco con 12 bolsillos funcionales. Diseño ergonómico para pesca.', stock: 10 },
  { name: 'Remera UV Protection 50+', brand: 'Columbia', categorySlug: 'pesca', subcategory: 'ropa-pesca', price: 39000, oldPrice: 48000, badge: 'Sale', badgeType: 'sale', sizes: ['S','M','L','XL','XXL'], colors: ['Blanco','Celeste','Beige'], image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80', featured: false, description: 'Remera manga larga con protección UV 50+. Tela transpirable.', stock: 25 },
  { name: 'Pantalón Pesca Convertible', brand: 'Columbia', categorySlug: 'pesca', subcategory: 'ropa-pesca', price: 58000, oldPrice: null, badge: null, badgeType: null, sizes: ['S','M','L','XL','XXL'], colors: ['Beige','Verde','Gris'], image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&q=80', featured: false, description: 'Pantalón convertible a short con múltiples bolsillos. Tela rip-stop.', stock: 18 },
  { name: 'Bota Trekking Moab 3 Mid WP', brand: 'Julbo', categorySlug: 'calzado', subcategory: 'trekking', price: 95000, oldPrice: 118000, badge: 'Sale', badgeType: 'sale', sizes: ['38','39','40','41','42','43','44','45'], colors: ['Marrón','Negro','Verde'], image: 'https://images.unsplash.com/photo-1655976795408-92a8498838c2?w=500&q=80', featured: true, description: 'La bota de trekking más vendida. Impermeable, suela Vibram, soporte tobillo.', stock: 14 },
  { name: 'Zapatilla Speedcross 6 Trail', brand: 'Salomon', categorySlug: 'calzado', subcategory: 'trail', price: 112000, oldPrice: null, badge: 'Nuevo', badgeType: 'new', sizes: ['38','39','40','41','42','43','44','45','46'], colors: ['Negro/Rojo','Azul/Naranja','Verde/Negro'], image: 'https://images.unsplash.com/photo-1655976795374-6b519928f1e1?w=500&q=80', featured: true, description: 'Zapatilla de trail running con agarre agresivo Contagrip.', stock: 9 },
  { name: 'Sandalia Teva Tirra', brand: 'Teva', categorySlug: 'calzado', subcategory: 'sandalias', price: 68000, oldPrice: null, badge: null, badgeType: null, sizes: ['36','37','38','39','40','41','42'], colors: ['Negro','Azul','Naranja'], image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=500&q=80', featured: false, description: 'Sandalia outdoor con sistema de ajuste de 4 puntos.', stock: 22 },
  { name: 'Bota Montaña Glacier XT', brand: 'Salomon', categorySlug: 'calzado', subcategory: 'botas', price: 185000, oldPrice: null, badge: 'Nuevo', badgeType: 'new', sizes: ['39','40','41','42','43','44','45'], colors: ['Negro','Gris/Rojo'], image: 'https://images.unsplash.com/photo-1510771463146-e89e6e86560e?w=500&q=80', featured: false, description: 'Bota de alta montaña con forro Thinsulate. Compatible con crampones.', stock: 5 },
  { name: 'Mochila Talon 22 Litros', brand: 'Salomon', categorySlug: 'accesorios', subcategory: 'mochilas', price: 132000, oldPrice: 158000, badge: 'Sale', badgeType: 'sale', sizes: ['Único'], colors: ['Negro','Naranja','Azul'], image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80', featured: false, description: 'Mochila trail running 22L con sistema de hidratación 1.5L incluido.', stock: 7 },
  { name: 'Buff Tubular Merino Wool', brand: 'Buff', categorySlug: 'accesorios', subcategory: 'accesorios', price: 18500, oldPrice: null, badge: null, badgeType: null, sizes: ['Único'], colors: ['Camuflaje','Negro','Naranja','Gris'], image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=500&q=80', featured: false, description: 'Tubular de lana merino natural. Termorregulador y antibacterial.', stock: 30 },
  { name: 'Gorra Omni-Shade UPF 50', brand: 'Columbia', categorySlug: 'accesorios', subcategory: 'accesorios', price: 22000, oldPrice: null, badge: null, badgeType: null, sizes: ['Único'], colors: ['Caqui','Negro','Azul','Rojo'], image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&q=80', featured: false, description: 'Gorra con protección solar UPF 50+. Tela transpirable.', stock: 35 },
  { name: 'Mochila Bora 65 Litros', brand: 'Ansilta', categorySlug: 'accesorios', subcategory: 'mochilas', price: 168000, oldPrice: null, badge: 'Nuevo', badgeType: 'new', sizes: ['S/M','M/L'], colors: ['Rojo','Verde','Azul'], image: 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=500&q=80', featured: false, description: 'Mochila técnica para trekking de varios días. Sistema de suspensión AirSpeed, 65 litros.', stock: 4 },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const categoryRepo = app.get(getRepositoryToken(Category));
  const productRepo = app.get(getRepositoryToken(Product));
  const userRepo = app.get(getRepositoryToken(User));

  console.log('🌱 Seeding database...');

  // Crear categorías
  const categoryMap: Record<string, Category> = {};
  for (const cat of CATEGORIES) {
    const exists = await categoryRepo.findOne({ where: { slug: cat.slug } });
    if (!exists) {
      const saved = await categoryRepo.save(categoryRepo.create(cat));
      categoryMap[cat.slug] = saved;
      console.log(`  ✅ Categoría: ${cat.name}`);
    } else {
      categoryMap[cat.slug] = exists;
      console.log(`  ⏭ Categoría ya existe: ${cat.name}`);
    }
  }

  // Crear productos
  for (const p of PRODUCTS_DATA) {
    const exists = await productRepo.findOne({ where: { name: p.name } });
    if (!exists) {
      const { categorySlug, ...rest } = p;
      await productRepo.save(productRepo.create({
        ...rest,
        category: categoryMap[categorySlug],
      }));
      console.log(`  ✅ Producto: ${p.name}`);
    } else {
      console.log(`  ⏭ Producto ya existe: ${p.name}`);
    }
  }

  // Crear usuario admin
  const adminExists = await userRepo.findOne({ where: { email: 'admin@pampaoutdoor.com' } });
  if (!adminExists) {
    const hashed = await bcrypt.hash('admin1234', 10);
    await userRepo.save(userRepo.create({
      email: 'admin@pampaoutdoor.com',
      name: 'Admin Pampa',
      password: hashed,
      role: UserRole.ADMIN,
    }));
    console.log('  ✅ Usuario admin creado: admin@pampaoutdoor.com / admin1234');
  }

  console.log('✅ Seed completado!');
  await app.close();
}

bootstrap();
