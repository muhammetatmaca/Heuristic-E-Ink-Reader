import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  FlatList,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SERIF_FONT = Platform.select({ ios: 'Georgia', android: 'serif' });
const MONO_FONT = Platform.select({ ios: 'Menlo', android: 'monospace' });
const CURSIVE_FONT = Platform.select({ ios: 'Snell Roundhand', android: 'cursive' });

interface OnboardingSlide {
  id: string;
  romanNumeral: string;
  chapterBadge: string;
  outlineHeading: string;
  title: string;
  quote: string;
  author: string;
  authorNote: string;
  featureTitle: string;
  featureDesc: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'slide-1',
    romanNumeral: 'I',
    chapterBadge: 'BÖLÜM I • VAROLUŞ VE BELLEK',
    outlineHeading: 'LITERATURE',
    title: 'Dokunmanın ve Zihnin Büyüsü',
    quote:
      'Kitap, insanın belleğinin ve düş gücünün bir uzantısıdır. Diğer tüm icatlar bedenimizin uzantısıyken, yalnızca kitap ruhumuzun kutsal nesnesidir.',
    author: 'Jorge Luis Borges',
    authorNote: 'Buenos Aires Kütüphanesi, 1971',
    featureTitle: 'Nörolojik Kağıt Odaklanması',
    featureDesc:
      'Mavi ışıktan arındırılmış mat yüzey, beyninizi ekrandan okuma refleksinden kurtarıp derin odaklanma haline geçirir.',
  },
  {
    id: 'slide-2',
    romanNumeral: 'II',
    chapterBadge: 'BÖLÜM II • KUSURSUZ İCAT',
    outlineHeading: 'TACTILE INK',
    title: 'Mürekkep, Kağıt ve Zaman',
    quote:
      'Kitap kağıttan ve mürekkepten fazlasıdır; tekerlek gibi, çatal gibi kusursuz bir icattır. Ondan daha mükemmel bir bilgi sığınağı yapılamaz.',
    author: 'Umberto Eco',
    authorNote: 'Gülün Adı ve Kitap Üzerine, 1980',
    featureTitle: 'Elektroforetik Mikro-Pigment',
    featureDesc:
      'Ekranda foton yayan LED yerine, voltaj darbeleriyle hareket eden gerçek siyah/beyaz titanyum dioksit pigmentleri çalışır.',
  },
  {
    id: 'slide-3',
    romanNumeral: 'III',
    chapterBadge: 'BÖLÜM III • DERİN SESSİZLİK',
    outlineHeading: 'SANCTUARY',
    title: 'Sessizliğin ve Yalnızlığın Mabedi',
    quote:
      'Okuma, yalnızlığın ortasında kurulan ve insanı kendi derin iç sesiyle baş başa bırakan en asil ve en samimi iletişim biçimidir.',
    author: 'Marcel Proust',
    authorNote: 'Kayıp Zamanın İzinde, 1913',
    featureTitle: 'Bildirimsiz Saf Okuma Mabedi',
    featureDesc:
      'Sizi bölecek bildirimler, dikkat dağıtıcı renk cümbüşü veya pop-up reklamlar yok. Yalnızca siz ve yazarın düşünceleri.',
  },
  {
    id: 'slide-4',
    romanNumeral: 'IV',
    chapterBadge: 'BÖLÜM IV • DOKU VE NOSTALJİ',
    outlineHeading: 'PARCHMENT',
    title: 'Kağıdın Rengi ve Zamanın İzi',
    quote:
      'Yeni bir kitaba başlamak, yeni bir dünyaya adım atmaktır; her çevrilen sayfa zamanda ve mekanda atılan kutsal bir adımdır.',
    author: 'Italo Calvino',
    authorNote: 'Bir Kış Gecesi Eğer Bir Yolcu, 1979',
    featureTitle: '5 Otantik Fiziksel Kağıt Tonu',
    featureDesc:
      'Sarı kitap parşömeni (#F4F1D0), pamuklu lifli kağıt, kraft, parşömen ve gazete kağıdı dokuları arasında anında geçiş yapın.',
  },
  {
    id: 'slide-5',
    romanNumeral: 'V',
    chapterBadge: 'BÖLÜM V • 3D MEKANİK',
    outlineHeading: 'PAGE FLIP',
    title: 'Sayfayı Çevirmenin Hazzı',
    quote:
      'Bazen cennetin, bitmek tükenmek bilmeyen ve aralıksız zevkle okunan sonsuz bir kütüphane olduğuna inanırım.',
    author: 'Virginia Woolf',
    authorNote: 'Kendine Ait Bir Oda, 1929',
    featureTitle: 'Three.js 3D Silindirik Mesh Bükülmesi',
    featureDesc:
      'Köşesinden tuttuğunuzda esneyip katlanan 48x48 poligonlu 3D silindirik kağıt fiziği ile gerçek yaprak çevirme hissi.',
  },
  {
    id: 'slide-6',
    romanNumeral: 'VI',
    chapterBadge: 'BÖLÜM VI • GÖZ SAĞLIĞI',
    outlineHeading: 'CARTA SCREEN',
    title: 'Işıksız Yüzey & Halasyon Önleme',
    quote:
      'Bir kitap, içimizdeki donmuş denizi parçalayacak bir balta gibi olmalıdır; zihni sarsmalı ve derin uykusundan uyandırmalıdır.',
    author: 'Franz Kafka',
    authorNote: 'Dönüşüm ve Günlükler, 1912',
    featureTitle: 'Anti-Halasyon & 16-Ton Gri Matris',
    featureDesc:
      'Karanlıkta göz kamaşmasını önleyen halasyon filtresi ve 16 seviyeli Kindle Carta monokrom gri tonlama motoru.',
  },
  {
    id: 'slide-7',
    romanNumeral: 'VII',
    chapterBadge: 'BÖLÜM VII • DALGA BOYU',
    outlineHeading: 'WAVEFORM',
    title: 'LUT Voltaj Darbeleri ve Temizlik',
    quote:
      'Kitap bir limandı benim için. Kitaplarda yaşadım. Ve kitaptaki insanları sokaktakilerden çok daha fazla sevdim.',
    author: 'Cemil Meriç',
    authorNote: 'Bu Ülke, 1974',
    featureTitle: 'Regal & GC16 Sürüş Modları',
    featureDesc:
      'Hayalet izleri (ghosting) sıfırlayan diferansiyel Regal LUT sürüşü ve donanımsal +15V/-15V tam kinetik çakım simülasyonu.',
  },
  {
    id: 'slide-8',
    romanNumeral: 'VIII',
    chapterBadge: 'BÖLÜM VIII • OPTİK MATRİS',
    outlineHeading: 'DITHERING',
    title: 'Atkinson ve Hata Yayılımı',
    quote:
      'Kitaplar bizi kendimize getiren aynalardır; harflerin ardındaki derinlik insan ruhunun en saf ve en berrak yankısıdır.',
    author: 'Ahmet Hamdi Tanpınar',
    authorNote: 'Huzur, 1948',
    featureTitle: 'Gelişmiş Noktalama Algoritmaları',
    featureDesc:
      'Atkinson, Floyd-Steinberg ve Bayer 4x4 matrisleri ile metin kenarlarında mikro-kontrastı maksimum seviyeye çıkaran optik işleme.',
  },
  {
    id: 'slide-9',
    romanNumeral: 'IX',
    chapterBadge: 'BÖLÜM IX • ÖZGÜRLÜK',
    outlineHeading: 'EPUB & PDF',
    title: 'Kendi Kütüphaneni Oluştur',
    quote:
      'Kitapsız bir oda, ruhsuz bir bedene benzer; insanın yaşadığı yer ancak sayfaların kokusuyla gerçek bir yuvaya dönüşür.',
    author: 'Marcus Tullius Cicero',
    authorNote: 'De Oratore, M.Ö. 55',
    featureTitle: 'Cihaz Hafızasında Kalıcı Arşiv',
    featureDesc:
      'Telefonunuzdaki dilediğiniz EPUB ve orijinal PDF kitaplarını yükleyin. Uygulamayı kapatsanız dahi tüm sayfalarınız kalıcı olarak saklanır.',
  },
  {
    id: 'slide-10',
    romanNumeral: 'X',
    chapterBadge: 'BÖLÜM X • YOLCULUK',
    outlineHeading: 'WELCOME',
    title: 'Dijital Çağda Kağıt Mabediniz',
    quote:
      'Kitaplar dünyadaki en sessiz ve en sadık dostlardır; en bilge danışmanlar ve en sabırlı öğretmenlerdir.',
    author: 'Stefan Zweig',
    authorNote: 'Dünün Dünyası, 1942',
    featureTitle: 'Okuma Yolculuğunuz Başlıyor',
    featureDesc:
      'Kitaplığınızdaki Guy de Maupassant ve Margaret Ayer Barnes eserleriyle hemen okumaya başlayabilir veya kendi arşivinizi ekleyebilirsiniz.',
  },
];

const CulturalArtMotif: React.FC<{ size?: number }> = ({ size = 130 }) => {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <Circle cx="60" cy="60" r="54" fill="rgba(105, 118, 62, 0.14)" />
        <Circle cx="60" cy="60" r="46" stroke="#69763E" strokeWidth="1" strokeDasharray="3 3" opacity={0.6} />
        <Rect
          x="36"
          y="36"
          width="48"
          height="48"
          transform="rotate(45 60 60)"
          stroke="#A3B46F"
          strokeWidth="1.5"
          fill="rgba(105, 118, 62, 0.25)"
        />
        <Rect
          x="42"
          y="42"
          width="36"
          height="36"
          transform="rotate(45 60 60)"
          stroke="#ECEADF"
          strokeWidth="1"
          opacity={0.65}
        />
        <Path
          d="M42 68C51 64 60 64 60 64C60 64 69 64 78 68V47C69 43 60 43 60 43C60 43 51 43 42 47V68Z"
          fill="#ECEADF"
          opacity={0.95}
        />
        <Path d="M60 43V64" stroke="#20260C" strokeWidth="1.8" strokeLinecap="round" />
        <Path d="M60 16V26M60 94V104M16 60H26M94 60H104" stroke="#A3B46F" strokeWidth="1.6" strokeLinecap="round" />
        <Circle cx="60" cy="60" r="3" fill="#69763E" />
      </Svg>
    </View>
  );
};

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const jumpToSlide = (idx: number) => {
    flatListRef.current?.scrollToIndex({ index: idx, animated: true });
    setCurrentIndex(idx);
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      jumpToSlide(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      jumpToSlide(currentIndex - 1);
    }
  };

  const isLast = currentIndex === ONBOARDING_SLIDES.length - 1;

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={[styles.fullSlide, { width: SCREEN_WIDTH }]}>
        <Text style={styles.giantOutlineTop} numberOfLines={1}>
          {item.outlineHeading}
        </Text>
        <Text style={styles.giantOutlineBottom} numberOfLines={1}>
          {item.outlineHeading}
        </Text>

        <View style={styles.contentColumn}>
          {/* Top Chapter Inscription Pill */}
          <View style={styles.monumentalBadge}>
            <Text style={styles.monumentalBadgeText}>{item.chapterBadge}</Text>
            <View style={styles.romanPillCircle}>
              <Text style={styles.romanPillText}>{item.romanNumeral}</Text>
            </View>
          </View>

          {/* Central Artwork & Inscribed Title */}
          <View style={styles.artSection}>
            <CulturalArtMotif size={SCREEN_WIDTH * 0.3} />
            <Text style={styles.inscribedTitle}>{item.title}</Text>
            <View style={styles.fleuronLine}>
              <View style={styles.fleuronBar} />
              <Text style={styles.fleuronSymbol}>✦</Text>
              <View style={styles.fleuronBar} />
            </View>
          </View>

          {/* Classical Literary Quote Box */}
          <View style={styles.literaryQuoteFrame}>
            <Text style={styles.dropQuoteMark}>“</Text>
            <Text style={styles.classicalQuoteText}>{item.quote}</Text>
            <View style={styles.authorSignRow}>
              <Text style={styles.authorSignName}>— {item.author}</Text>
              <Text style={styles.authorSignNote}>{item.authorNote}</Text>
            </View>
          </View>

          {/* Tech Feature Ex-Libris Box */}
          <View style={styles.exLibrisTechBox}>
            <View style={styles.techTitleRow}>
              <Feather name="bookmark" size={13} color="#A3B46F" />
              <Text style={styles.techTitleText}>{item.featureTitle}</Text>
            </View>
            <Text style={styles.techDescText}>{item.featureDesc}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose}>
      <StatusBar barStyle="light-content" backgroundColor="#20260C" />
      <View
        style={[
          styles.rootContainer,
          {
            paddingTop: Math.max(insets.top, 20),
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        {/* Floating Antique Close Button */}
        <TouchableOpacity
          onPress={onClose}
          style={[styles.antiqueCloseBtn, { top: Math.max(insets.top, 16) }]}
          accessibilityLabel="Kapat"
        >
          <Ionicons name="close" size={20} color="#ECEADF" />
        </TouchableOpacity>

        {/* Carousel */}
        <FlatList
          ref={flatListRef}
          data={ONBOARDING_SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setCurrentIndex(idx);
          }}
          renderItem={renderSlide}
        />

        {/* ── Cultural Art Parchment Slider Controls ── */}
        <View style={styles.culturalControlBar}>
          {/* Roman Numerals Slider Strip */}
          <View style={styles.romanTrackContainer}>
            <View style={styles.romanTrackLine} />
            <View style={styles.romanNumbersRow}>
              {ONBOARDING_SLIDES.map((slide, i) => {
                const isActive = i === currentIndex;
                return (
                  <TouchableOpacity
                    key={`roman-${i}`}
                    onPress={() => jumpToSlide(i)}
                    style={[
                      styles.romanTickBtn,
                      isActive && styles.romanTickBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.romanTickText,
                        isActive && styles.romanTickTextActive,
                      ]}
                    >
                      {slide.romanNumeral}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Bottom Action Row (Engraved Buttons) */}
          <View style={styles.bottomActionRow}>
            <TouchableOpacity
              onPress={handlePrev}
              disabled={currentIndex === 0}
              style={[styles.parchmentNavBtn, { opacity: currentIndex === 0 ? 0.25 : 1 }]}
            >
              <Text style={styles.parchmentNavBtnSymbol}>‹</Text>
              <Text style={styles.parchmentNavBtnText}>ÖNCEKİ YAPRAK</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              style={[styles.parchmentNavBtn, isLast ? styles.startBtnActive : styles.nextBtnActive]}
            >
              <Text style={[styles.parchmentNavBtnText, styles.nextBtnTextActive]}>
                {isLast ? '✦ KÜTÜPHANEYE BAŞLA ✦' : 'SONRAKİ YAPRAK'}
              </Text>
              <Text style={[styles.parchmentNavBtnSymbol, styles.nextBtnTextActive]}>
                {isLast ? '✦' : '›'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#20260C',
    justifyContent: 'space-between',
  },
  antiqueCloseBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 60,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(43, 51, 20, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(163, 180, 111, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullSlide: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
    position: 'relative',
  },
  giantOutlineTop: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 48,
    fontFamily: SERIF_FONT,
    fontWeight: '900',
    color: 'rgba(105, 118, 62, 0.16)',
    letterSpacing: 8,
  },
  giantOutlineBottom: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 48,
    fontFamily: SERIF_FONT,
    fontWeight: '900',
    color: 'rgba(105, 118, 62, 0.14)',
    letterSpacing: 8,
  },
  contentColumn: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  monumentalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#2B3314',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(163, 180, 111, 0.4)',
  },
  monumentalBadgeText: {
    fontSize: 10,
    fontFamily: MONO_FONT,
    fontWeight: '700',
    color: '#A3B46F',
    letterSpacing: 1.4,
  },
  romanPillCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#69763E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  romanPillText: {
    fontSize: 10,
    fontFamily: SERIF_FONT,
    fontWeight: '900',
    color: '#ECEADF',
  },
  artSection: {
    alignItems: 'center',
    gap: 6,
  },
  inscribedTitle: {
    fontSize: 22,
    fontFamily: SERIF_FONT,
    fontWeight: '800',
    color: '#ECEADF',
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 27,
  },
  fleuronLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 2,
  },
  fleuronBar: {
    width: 32,
    height: 1,
    backgroundColor: '#69763E',
  },
  fleuronSymbol: {
    fontSize: 11,
    color: '#A3B46F',
  },
  literaryQuoteFrame: {
    backgroundColor: 'rgba(43, 51, 20, 0.88)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(105, 118, 62, 0.4)',
    padding: 16,
    width: '100%',
    gap: 6,
    position: 'relative',
  },
  dropQuoteMark: {
    position: 'absolute',
    top: -8,
    left: 12,
    fontSize: 34,
    fontFamily: SERIF_FONT,
    fontWeight: '900',
    color: '#69763E',
    opacity: 0.6,
  },
  classicalQuoteText: {
    fontSize: 14.5,
    fontFamily: SERIF_FONT,
    fontStyle: 'italic',
    color: '#ECEADF',
    lineHeight: 21,
    textAlign: 'left',
    paddingTop: 4,
    letterSpacing: 0.2,
  },
  authorSignRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 2,
  },
  authorSignName: {
    fontSize: 13,
    fontFamily: SERIF_FONT,
    fontWeight: '700',
    color: '#A3B46F',
  },
  authorSignNote: {
    fontSize: 13,
    fontFamily: CURSIVE_FONT,
    fontStyle: 'italic',
    color: 'rgba(236, 234, 223, 0.7)',
  },
  exLibrisTechBox: {
    backgroundColor: '#1B210B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(105, 118, 62, 0.3)',
    padding: 12,
    width: '100%',
    gap: 4,
  },
  techTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  techTitleText: {
    fontSize: 11,
    fontFamily: MONO_FONT,
    fontWeight: '800',
    color: '#A3B46F',
    letterSpacing: 0.8,
  },
  techDescText: {
    fontSize: 12,
    fontFamily: SERIF_FONT,
    color: 'rgba(236, 234, 223, 0.88)',
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  culturalControlBar: {
    paddingHorizontal: 16,
    gap: 12,
    zIndex: 50,
  },
  romanTrackContainer: {
    position: 'relative',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  romanTrackLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: 'rgba(105, 118, 62, 0.35)',
  },
  romanNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  romanTickBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#20260C',
    borderWidth: 1,
    borderColor: 'rgba(105, 118, 62, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  romanTickBtnActive: {
    backgroundColor: '#A3B46F',
    borderColor: '#ECEADF',
    transform: [{ scale: 1.15 }],
  },
  romanTickText: {
    fontSize: 9,
    fontFamily: SERIF_FONT,
    fontWeight: '800',
    color: 'rgba(236, 234, 223, 0.5)',
  },
  romanTickTextActive: {
    color: '#20260C',
    fontWeight: '900',
  },
  bottomActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  parchmentNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2B3314',
    borderWidth: 1,
    borderColor: 'rgba(105, 118, 62, 0.45)',
  },
  parchmentNavBtnText: {
    fontSize: 11,
    fontFamily: MONO_FONT,
    fontWeight: '700',
    color: '#ECEADF',
    letterSpacing: 0.8,
  },
  parchmentNavBtnSymbol: {
    fontSize: 16,
    fontFamily: SERIF_FONT,
    color: '#A3B46F',
  },
  nextBtnActive: {
    backgroundColor: '#38431B',
    borderColor: '#A3B46F',
    flex: 1,
  },
  startBtnActive: {
    backgroundColor: '#A3B46F',
    borderColor: '#ECEADF',
    flex: 1,
  },
  nextBtnTextActive: {
    color: '#ECEADF',
    fontWeight: '800',
  },
});
