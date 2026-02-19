export type WpCliEnvType = 'vip' | 'ssh' | 'wpenv' | 'ddev' | 'localhost';

export type SshConfig = {
	login: string;
	host: string;
	port?: string;
	path?: string;
};

export type VipConfig = {
	appName: string;
	env: string;
};

export type WpCliConfig = {
	envType: WpCliEnvType;
	path?: string; // Local filesystem path (for localhost, wpenv)
	ssh?: SshConfig; // Only required for SSH
	vip?: VipConfig; // Only required for VIP
};

export type WpCliPostCreate = {
	post_type: 'post' | 'page' | 'product' | 'event' | ( string & {} );
	post_title: string;
	post_status:
		| 'publish'
		| 'future'
		| 'draft'
		| 'pending'
		| 'private'
		| 'trash'
		| 'auto-draft'
		| 'inherit';
	post_content?: string;
	post_excerpt?: string;
};

export type PostRelations = {
	postId: string;
	postType: string;
	relatedPostId: string;
};
