import React, { useMemo, useCallback } from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import RenderHTML, {
  HTMLContentModel,
  HTMLElementModel,
  CustomRendererProps,
  MixedStyleRecord,
  CustomBlockRenderer,
  TBlock,
  TNodeChildrenRenderer,
} from 'react-native-render-html';
import AudioPlayer from './AudioPlayer';
import SplideCarousel from './SplideCarousel';
import YouTubePlayer from './YouTubePlayer';

interface HtmlRendererProps {
  htmlContent: string;
  contentWidth?: number;
  baseStyle?: any;
  numberOfLines?: number;
  renderTextOnly?: boolean;
}

const HtmlRenderer: React.FC<HtmlRendererProps> = ({
  htmlContent,
  contentWidth,
  baseStyle,
  numberOfLines = 0,
  renderTextOnly = true,
}) => {
  const { width } = useWindowDimensions();
  const containerWidth = contentWidth || width;

  // Memoized custom renderer for <audio>
  const audioRenderer: CustomBlockRenderer = useCallback(({ tnode }: CustomRendererProps<TBlock>) => {
    const sourceNode = tnode.children.find((child: any) => child.attributes?.src);
    const src = sourceNode?.attributes?.src;
    const title = tnode.attributes['data-title'] || 'Untitled';
    const subtitle = tnode.attributes['data-subtitle'] || 'Unknown';
    const thumbnail = tnode.attributes['data-thumbnail'] || '';

    if (!src) return null;

    return (
      <AudioPlayer
        src={src}
        title={title}
        subtitle={subtitle}
        thumbnail={{ uri: thumbnail }}
      />
    );
  }, []);

  // Memoized iframe renderer for YouTube and other video content
  const iframeRenderer: CustomBlockRenderer = useCallback(({ tnode }: CustomRendererProps<TBlock>) => {
    const src = tnode.attributes.src;
    if (!src) return null;

    // Calculate appropriate dimensions
    const iframeWidth = containerWidth - 30; // Account for padding
    const aspectRatio = 16 / 9; // Standard video aspect ratio
    const iframeHeight = iframeWidth / aspectRatio;

    return (
      <YouTubePlayer 
        src={src}
        width={iframeWidth}
        height={iframeHeight}
      />
    );
  }, [containerWidth]);

  // Memoized Splide carousel renderer
  const splideRenderer: CustomBlockRenderer = useCallback(({ tnode }: CustomRendererProps<TBlock>) => {
    if (!tnode.attributes.class?.includes('splide')) {
      return <TNodeChildrenRenderer tnode={tnode} />;
    }

    try {
      const trackNode = tnode.children.find((c: any) =>
        c.attributes.class?.includes('splide__track')
      );
      const listNode = trackNode?.children.find((c: any) =>
        c.tagName === 'ul' && c.attributes.class?.includes('splide__list')
      );

      if (!listNode) return null;

      const slides = listNode.children
        .filter((li: any) => li.tagName === 'li' && li.attributes.class?.includes('splide__slide'))
        .map((li: any) => {
          // Find the anchor tag that contains the image
          const anchor = li.children.find((c: any) => c.tagName === 'a');
          // Find the image inside the anchor or directly under li
          const img = (anchor?.children || li.children).find((c: any) => c.tagName === 'img');
          // Find the caption div (usually right after the anchor)
          const captionDiv = li.children.find((c: any) => c.tagName === 'div' && c !== anchor);

          // Get the image URL with fallbacks: data-splide-lazy > src > anchor's href
          const imageUrl = (
            img?.attributes['data-splide-lazy'] ||
            img?.attributes.src ||
            anchor?.attributes.href ||
            ''
          );

          // Get the full size URL from anchor's href if available
          const fullSizeUrl = anchor?.attributes.href || imageUrl;

          // Get alt text from image or use a default
          const altText = img?.attributes.alt || 'Image';

          // Get caption text, handling different possible structures
          const captionChild = captionDiv?.children[0]?.children[0] as { data: string };
          const captionText = captionChild?.data || '';

          return {
            imageUrl,
            alt: altText,
            caption: captionText || ' ', // Return space to maintain layout even without caption
            fullSizeUrl
          };
        })
        .filter((slide: any) => slide.imageUrl);

      return slides.length > 0 ? (
        <View style={[styles.sliderContainer, { width: containerWidth }]}>
          <SplideCarousel slides={slides} width={containerWidth} />
        </View>
      ) : null;
    } catch (error) {
      console.error('Error rendering splide carousel:', error);
      return <TNodeChildrenRenderer tnode={tnode} />;
    }
  }, [containerWidth]);

  // Memoized renderers object with stable references
  const renderers = useMemo(() => ({
    audio: audioRenderer,
    div: splideRenderer,
    iframe: iframeRenderer,
  }), [audioRenderer, splideRenderer, iframeRenderer]);

  // Memoized custom HTML element models with stable references
  const customHTMLElementModels = useMemo(() => ({
    audio: HTMLElementModel.fromCustomModel({
      tagName: 'audio',
      contentModel: HTMLContentModel.block,
    }),
    iframe: HTMLElementModel.fromCustomModel({
      tagName: 'iframe',
      contentModel: HTMLContentModel.block,
    }),
  }), []);

  // Memoized class styles with stable references
  const classStyles = useMemo(() => ({
    'credits-overlay': { textAlign: 'right' as const },
  }), []);

  // Memoized tags styles with stable references
  const tagsStyles: MixedStyleRecord = useMemo(() => ({
    body: { margin: 0, padding: 0 },
    p: {
      margin: 0,
      padding: 0,
      marginVertical: 5,
      paddingBottom: 10,
      color: '#000',
      fontSize: 16,
      lineHeight: 20,
      ...(numberOfLines > 0 && {
        overflow: 'hidden',
        maxHeight: numberOfLines * 20
      })
    },
    a: { color: '#1e88e5', textDecorationLine: 'none' },
    h1: { fontSize: 22, fontWeight: 'bold', marginVertical: 10 },
    h2: { fontSize: 20, fontWeight: 'bold', marginVertical: 8 },
    h3: { fontSize: 18, fontWeight: 'bold', marginVertical: 6 },
    h4: { fontSize: 16, fontWeight: 'bold', marginVertical: 10 },
    h5: { fontSize: 14, fontWeight: 'bold', marginVertical: 8 },
    h6: { fontSize: 12, fontWeight: 'bold', marginVertical: 6 },
    ul: { margin: 0, paddingLeft: 15, marginVertical: 5 },
    ol: { margin: 0, paddingLeft: 15, marginVertical: 5 },
    li: { marginBottom: 4 },
    strong: { fontWeight: 'bold', marginVertical: 5 },
    em: { fontStyle: 'italic' },
    u: { textDecorationLine: 'underline' },
    figcaption: { fontSize: 13, marginVertical: 0, lineHeight: 16, paddingBottom: 15 },
    div: { fontSize: 12, margin: 0, padding: 0, width: '100%' },
    img: {
      margin: 0,
      padding: 0,
      marginVertical: 5,
      resizeMode: 'cover',
      objectFit: 'cover',
      alignSelf: 'stretch',
    },
    figure: {
      margin: 0,
      padding: 0,
      marginVertical: 5,
      resizeMode: 'cover',
      objectFit: 'cover',
      alignSelf: 'stretch',
    },
  }), [numberOfLines]);

  // Memoized clean HTML function with stable reference
  const cleanHtmlContent = useCallback((html: string) => {
    if (!html) return '';
    let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Only remove iframes when rendering text only
    if (renderTextOnly) {
      cleaned = cleaned.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
      cleaned = cleaned.replace(/<iframe[^>]*>/gi, '');
      
      const allowedTags = ['p'];
      const tagPattern = new RegExp(`<\/?(?!(${allowedTags.join('|')})\\b)[^>]*>`, 'gi');
      cleaned = cleaned.replace(tagPattern, '').trim();
      //const firstParagraph = cleaned.split('.')[0];
      //cleaned = firstParagraph;// + '...';
    }

    return cleaned;
  }, [renderTextOnly]);

  // Memoized processed HTML with stable reference
  const processedHtml = useMemo(() => cleanHtmlContent(htmlContent), [htmlContent, cleanHtmlContent]);

  // Memoized base style with stable reference
  const memoizedBaseStyle = useMemo(() => ({ ...styles.base, ...baseStyle }), [baseStyle]);

  // Memoized default text props with stable reference
  const defaultTextProps = useMemo(() => 
    numberOfLines > 0
      ? { numberOfLines, ellipsizeMode: 'tail' as const }
      : undefined
  , [numberOfLines]);

  // Memoized RenderHTML props to prevent unnecessary re-renders
  const renderHtmlProps = useMemo(() => ({
    contentWidth: containerWidth,
    source: { html: processedHtml },
    tagsStyles,
    customHTMLElementModels,
    renderers,
    baseStyle: memoizedBaseStyle,
    systemFonts: ['System'],
    defaultTextProps,
    classesStyles: classStyles,
    enableExperimentalMarginCollapsing: true,
    computeEmbeddedMaxWidth: () => containerWidth,
  }), [
    containerWidth,
    processedHtml,
    tagsStyles,
    customHTMLElementModels,
    renderers,
    memoizedBaseStyle,
    defaultTextProps,
    classStyles,
  ]);

  return <RenderHTML {...renderHtmlProps} />;
};

const styles = StyleSheet.create({
  base: {
    padding: 0,
    margin: 0,
  },
  sliderContainer: {
    marginLeft: -15,
    overflow: 'hidden',
    flex: 1,
  },
});

export default HtmlRenderer;