import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native'
import React from 'react'
import { color } from '../utils/colorUtils'

interface SectionTitleProps {
  title: string
  subtitle?: string
  line?: boolean
  titleStyle?: StyleProp<TextStyle>
  subtitleStyle?: StyleProp<TextStyle>
  lineStyle?: StyleProp<ViewStyle>
  containerStyle?: StyleProp<ViewStyle>
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, subtitle, line, titleStyle, subtitleStyle, lineStyle, containerStyle }) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.title, titleStyle]}>{title.toUpperCase()}</Text>
      {subtitle && <Text style={[styles.subtitle, subtitleStyle]}>{subtitle.toUpperCase()}</Text>}
      {line && <View style={[styles.line, lineStyle]} />}
    </View>
  )
}

export default SectionTitle

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  title: { fontWeight: 'bold', fontSize: 16, color: color.primary, textTransform: 'uppercase' },
  subtitle: { fontWeight: 'bold', fontSize: 16, color: color.secondary, textTransform: 'uppercase' },
  line: { marginTop: "auto", marginBottom: 4, height: 2, backgroundColor: color.primary, flex: 1 },
})