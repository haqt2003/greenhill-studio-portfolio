export type Locale = 'en' | 'vi';

export interface LocalizedText {
  en: string;
  vi: string;
}

export interface Project {
  title: LocalizedText;
  category: LocalizedText;
  year: string;
  description: LocalizedText;
  tags: LocalizedText[];
  href?: string;
  linkLabel?: LocalizedText;
  theme: 'sage' | 'sand' | 'coral';
  image?: {
    src: string;
    alt: LocalizedText;
    presentation?: 'cover' | 'laptop' | 'showcase' | 'app';
    mobileSrc?: string;
    srcVi?: string;
    mobileSrcVi?: string;
    domain?: string;
  };
}

export const projects: Project[] = [
  {
    title: { en: 'Photogress', vi: 'Photogress' },
    category: { en: 'Mobile product', vi: 'Sản phẩm di động' },
    year: '2026',
    description: {
      en: 'An Android photo journal for capturing changes over time. Match each shot with a previous-photo overlay, organize your projects and turn your photos into time-lapse videos.',
      vi: 'Ứng dụng Android giúp ghi lại thay đổi qua từng bức ảnh. Căn góc chụp bằng ảnh trước, sắp xếp theo dự án và tạo video time-lapse từ hành trình của bạn.',
    },
    tags: [
      { en: 'Product design', vi: 'Thiết kế sản phẩm' },
      { en: 'Android', vi: 'Android' },
      { en: 'Local-first', vi: 'Ưu tiên dữ liệu cục bộ' },
    ],
    href: 'https://play.google.com/store/apps/details?id=com.greenhillstudio.photogress',
    linkLabel: { en: 'Get it on Google Play', vi: 'Tải trên Google Play' },
    theme: 'sage',
    image: {
      src: '/images/projects/photogress-store-growth-en.webp',
      mobileSrc: '/images/projects/photogress-store-overlay-en.webp',
      srcVi: '/images/projects/photogress-store-growth-vi.webp',
      mobileSrcVi: '/images/projects/photogress-store-overlay-vi.webp',
      presentation: 'app',
      alt: {
        en: 'Photogress Google Play screenshots showing plant progress and the previous-photo camera overlay',
        vi: 'Ảnh giới thiệu Photogress trên Google Play: theo dõi cây lớn và căn góc chụp bằng ảnh trước',
      },
    },
  },
  {
    title: { en: 'VMERDI', vi: 'VMERDI' },
    category: { en: 'Education platform', vi: 'Nền tảng giáo dục' },
    year: '2026',
    description: {
      en: 'A bilingual website for VMERDI, bringing courses, news and Montessori resources into one place that the team can manage on its own.',
      vi: 'Website song ngữ cho VMERDI, tập hợp khóa học, tin tức và tài liệu Montessori trong một nơi mà đội ngũ có thể chủ động quản lý.',
    },
    tags: [
      { en: 'Web design', vi: 'Thiết kế web' },
      { en: 'Bilingual', vi: 'Song ngữ' },
      { en: 'Content system', vi: 'Hệ thống nội dung' },
    ],
    href: 'https://www.vmerdi.edu.vn/',
    theme: 'sand',
    image: {
      src: '/images/projects/vmerdi-desktop.webp',
      mobileSrc: '/images/projects/vmerdi-mobile.webp',
      domain: 'vmerdi.edu.vn',
      alt: {
        en: 'VMERDI homepage shown in desktop and mobile mockups',
        vi: 'Giao diện trang chủ VMERDI trong mockup máy tính và điện thoại',
      },
      presentation: 'showcase',
    },
  },
  {
    title: { en: 'Bàn Tay Nhỏ Charity', vi: 'Quỹ Bàn Tay Nhỏ' },
    category: { en: 'Charity platform', vi: 'Nền tảng thiện nguyện' },
    year: '2026',
    description: {
      en: 'A website for sharing campaigns, updates and donation information, helping Bàn Tay Nhỏ Charity stay transparent and connected with supporters.',
      vi: 'Website giúp Quỹ Bàn Tay Nhỏ chia sẻ chiến dịch, cập nhật hoạt động và thông tin đóng góp một cách rõ ràng với nhà hảo tâm.',
    },
    tags: [
      { en: 'Responsive web', vi: 'Web responsive' },
      { en: 'Campaigns', vi: 'Chiến dịch' },
      { en: 'Editorial CMS', vi: 'CMS biên tập' },
    ],
    href: 'https://www.quytuthienbantaynho.edu.vn/vi',
    theme: 'coral',
    image: {
      src: '/images/projects/bantaynho-desktop.webp',
      mobileSrc: '/images/projects/bantaynho-mobile.webp',
      domain: 'quytuthienbantaynho.edu.vn',
      presentation: 'showcase',
      alt: {
        en: 'Bàn Tay Nhỏ Charity homepage shown in desktop and mobile mockups',
        vi: 'Giao diện trang chủ Quỹ Bàn Tay Nhỏ trong mockup máy tính và điện thoại',
      },
    },
  },
];
