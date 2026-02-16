import { test, expect } from '../utils/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect( page ).toHaveTitle( 'Mollie Payments for WooCommerce E2E Test Suite' );
});

test( 'Test CLI @Critical', async ( { page, cli } ) => {
	console.log(
		await cli.setWpConst( { WP_DEBUG: true } )
	);

	const postTitle = `Test post ${ Date.now() }`;
	const postId = await cli.postCreate( {
		post_type: 'post',
		post_title: postTitle,
		post_status: 'publish',
	} );

	await page.goto( `./?page_id=${ postId }` );
	await expect(
		page.locator( 'h1' ),
		'Assert page heading',
	).toHaveText( postTitle );
} );
