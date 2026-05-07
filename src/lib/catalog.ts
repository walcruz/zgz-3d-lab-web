import catalogManifest from './catalog-manifest.json';

export type CatalogGroupDefinition = {
	folder: string;
	eyebrow: string;
	title: string;
	sectionId: string;
};

export type RenderImage = {
	src: string;
	width: number;
	height: number;
	alt: string;
};

export type FolderSection = {
	folder: string;
	label: string;
	slug: string;
	images: RenderImage[];
	coverImage: RenderImage;
	groupFolder: string;
};

export type CatalogGroup = CatalogGroupDefinition & {
	sections: FolderSection[];
};

export const groupDefinitions: CatalogGroupDefinition[] = [
	{ folder: 'lqsale', eyebrow: 'LO MÁS POPULAR', title: 'Visual y directo.', sectionId: 'productos' },
	{ folder: 'Galeria', eyebrow: 'GALERIA', title: 'Productos.', sectionId: 'trabajos' },
];

const folderPresentation: Record<string, { label?: string; fallback: string; alt: string }> = {
	Figuras: {
		fallback: '/blog-placeholder-1.jpg',
		alt: 'Figura impresa en 3D',
	},
	Recambios: {
		fallback: '/blog-placeholder-2.jpg',
		alt: 'Recambio impreso en 3D',
	},
	Accessorios: {
		label: 'Accesorios',
		fallback: '/blog-placeholder-3.jpg',
		alt: 'Accesorio impreso en 3D',
	},
	Producto: {
		fallback: '/blog-placeholder-2.jpg',
		alt: 'Producto impreso en 3D',
	},
	miniaturas: {
		label: 'Miniaturas',
		fallback: '/blog-placeholder-1.jpg',
		alt: 'Miniatura impresa en 3D',
	},
	setup: {
		label: 'Setup',
		fallback: '/blog-placeholder-4.jpg',
		alt: 'Accesorio de setup impreso en 3D',
	},
	taller: {
		label: 'Taller',
		fallback: '/blog-placeholder-5.jpg',
		alt: 'Util de taller impreso en 3D',
	},
	'Marca propia': {
		fallback: '/gpt-logo2.png',
		alt: 'Marca propia ZGZ 3D Lab',
	},
};

const slugify = (value: string) =>
	value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');

export const formatLabel = (folder: string) => {
	const configured = folderPresentation[folder]?.label;
	if (configured) {
		return configured;
	}

	return folder
		.split(/[-_ ]+/)
		.filter(Boolean)
		.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
		.join(' ');
};

const getSubfolders = (groupFolder: string) => {
	const groupData = (catalogManifest as Record<string, Record<string, string[]>>)[groupFolder];
	if (!groupData) {
		return [];
	}
	return Object.keys(groupData).sort((left, right) => left.localeCompare(right));
};

const toRenderImages = (groupFolder: string, folder: string): RenderImage[] => {
	const presentation = folderPresentation[folder] ?? {
		fallback: '/blog-placeholder-1.jpg',
		alt: `${formatLabel(folder)} impreso en 3D`,
	};

	const groupData = (catalogManifest as Record<string, Record<string, string[]>>)[groupFolder];
	const files = groupData?.[folder] ?? [];

	if (files.length > 0) {
		return files.map((file) => ({
			src: `/catalog/${groupFolder}/${folder}/${file}`,
			width: 720,
			height: 480,
			alt: presentation.alt,
		}));
	}

	return [{ src: presentation.fallback, width: 720, height: 480, alt: presentation.alt }];
};

export const getCatalogGroups = (): CatalogGroup[] =>
	groupDefinitions.map((group) => ({
		...group,
		sections: getSubfolders(group.folder).map((folder) => {
			const images = toRenderImages(group.folder, folder);
			return {
				folder,
				label: formatLabel(folder),
				slug: slugify(folder),
				images,
				coverImage: images[0],
				groupFolder: group.folder,
			};
		}),
	}));

export const findCatalogSection = (groupSlug: string, folderSlug: string) => {
	const group = getCatalogGroups().find((entry) => slugify(entry.folder) === groupSlug);
	if (!group) {
		return null;
	}

	const section = group.sections.find((entry) => entry.slug === folderSlug);
	if (!section) {
		return null;
	}

	return { group, section };
};
