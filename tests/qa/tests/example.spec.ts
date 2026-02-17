import { test, expect } from '../utils/test';

test('Has title @Critical', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect( page ).toHaveTitle( 'Mollie Payments for WooCommerce E2E Test Suite' );
});

test( 'Test CLI @Critical', async ( { page, cli } ) => {
	await cli.setWpConst( { WP_DEBUG: true } );
	await cli.isPluginInstalled( 'mollie-payments-for-woocommerce' );

	const now = Date.now();
	const postTitle = `Test post ${ now }`;
	const postId = await cli.postCreate( {
		post_type: 'post',
		post_title: postTitle,
		post_status: 'publish',
	} );
	console.log( 'Post ID:', JSON.stringify( postId ) );
	
	await page.goto( `/` );
	await expect.soft(
		page.getByText( postTitle ).first(),
		'Assert post title',
	).toBeVisible();

	// Not working:
	await page.goto( `/test-post-${ now }/` );
	await expect.soft(
		page.locator( 'h1' ),
		'Assert page heading',
	).toHaveText( postTitle );

	await page.goto( `/?page_id=${ postId }` );
	await expect.soft(
		page.locator( 'h1' ),
		'Assert page heading',
	).toHaveText( postTitle );
} );
