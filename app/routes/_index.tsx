
import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {MockShopNotice} from '~/components/MockShopNotice';

export const meta: Route.MetaFunction = () => [
  {title: 'La Concheria | Pan Dulce Hecho con Cariño'},
  {
    name: 'description',
    content:
      'Descubre La Concheria Cafe. Pan dulce, conchitas y sabores tradicionales hechos con cariño.',
  },
];

export async function loader(args: Route.LoaderArgs) {
  const recommendedProducts = args.context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  const {collections} = await args.context.storefront.query(
    FEATURED_COLLECTION_QUERY,
  );

  return {
    isShopLinked: Boolean(args.context.env.PUBLIC_STORE_DOMAIN),
    featuredCollection: collections.nodes[0] ?? null,
    recommendedProducts,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();

  return (
    <main className="lc-storefront">
      {!data.isShopLinked && <MockShopNotice />}

      <section className="lc-hero">
        <div className="lc-hero__eyebrow">
          PANADERÍA · CAFÉ · TRADICIÓN
        </div>

        <div className="lc-hero__content">
          <p className="lc-hero__overline">
            Desde el corazón del Valle de Texas
          </p>

          <h1>
            El sabor de
            <br />
            <em>nuestra tradición.</em>
          </h1>

          <p className="lc-hero__description">
            Pan dulce, conchitas y un pedacito de México,
            hechos con mucho cariño.
          </p>

          <a href="#nuestro-pan" className="lc-button">
            Descubre nuestro pan
            <span aria-hidden="true"> →</span>
          </a>
        </div>

        {data.featuredCollection?.image && (
          <div className="lc-hero__image">
            <Image
              data={data.featuredCollection.image}
              sizes="(min-width: 900px) 50vw, 100vw"
              alt={
                data.featuredCollection.image.altText ||
                data.featuredCollection.title
              }
            />
          </div>
        )}
      </section>

      <div className="lc-marquee">
        <span>
          HECHO CON CARIÑO ✦ PAN DULCE ✦
          LA CONCHERIA CAFÉ ✦ SABOR A TRADICIÓN ✦
        </span>
      </div>

      <section id="nuestro-pan" className="lc-products">
        <div className="lc-section-heading">
          <p>DE NUESTRA PANADERÍA</p>
          <h2>Nuestro Pan Dulce</h2>
          <span>
            Una selección de nuestros favoritos,
            preparados con mucho amor.
          </span>
        </div>

        <Suspense fallback={<p>Cargando nuestro pan...</p>}>
          <Await resolve={data.recommendedProducts}>
            {(response) => (
              <div className="lc-products__grid">
                {response?.products.nodes.map((product) => (
                  <ProductItem
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            )}
          </Await>
        </Suspense>

        <div className="lc-products__footer">
          <Link to="/collections/all" className="lc-button">
            Ver todos los productos →
          </Link>
        </div>
      </section>

      <section className="lc-story">
        <p>UN PEDACITO DE MÉXICO</p>
        <h2>Tradición que se comparte.</h2>
        <p className="lc-story__description">
          Más que pan dulce, compartimos momentos,
          sabores y recuerdos que nos acercan a casa.
        </p>
        <a href="https://laconcheriacafe.com">
          Conoce nuestra cafetería ↗
        </a>
      </section>
    </main>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
