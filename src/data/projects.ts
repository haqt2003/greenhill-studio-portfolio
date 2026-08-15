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
  theme: 'sage' | 'sand' | 'coral';
  image?: {
    src: string;
    alt: LocalizedText;
    presentation?: 'cover' | 'laptop';
  };
}

export const projects: Project[] = [
  {
    title: { en: 'Progress', vi: 'Progress' },
    category: { en: 'Mobile product', vi: 'Sản phẩm di động' },
    year: '2026',
    description: {
      en: 'A private Android journal for comparing progress photos side by side and keeping a clear record over time.',
      vi: 'Ứng dụng Android giúp lưu ảnh tiến trình riêng tư, so sánh từng giai đoạn và nhìn lại thay đổi theo thời gian.',
    },
    tags: [
      { en: 'Product design', vi: 'Thiết kế sản phẩm' },
      { en: 'Android', vi: 'Android' },
      { en: 'Local-first', vi: 'Ưu tiên dữ liệu cục bộ' },
    ],
    theme: 'sage',
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
      src: '/images/projects/vmerdi-home.jpg',
      alt: {
        en: 'VMERDI website homepage',
        vi: 'Trang chủ website VMERDI',
      },
      presentation: 'laptop',
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
      src: '/images/projects/quy-ban-tay-nho.jpg',
      alt: {
        en: 'Children featured on the Bàn Tay Nhỏ Charity website',
        vi: 'Các em nhỏ xuất hiện trên website Quỹ Bàn Tay Nhỏ',
      },
    },
  },
];
