import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type Breaking = { id: number; title: string; type: string; };

type Props = {
  data: Breaking | null;
};

const BreakingBanner: React.FC<Props> = ({ data }) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const breaking = useMemo(() => data, [data]);
  if (!breaking || breaking.id === 0 || !breaking.title) {
    return null;
  }
  const getViewStyle = (newstype: string): ViewStyle => {
    switch (newstype) {
      case 'breakingnews':
        return { backgroundColor: '#ee1812' };
      case 'developingstory':
        return { backgroundColor: '#ffce16' };
      default:
        return {};
    }
  };

  const getTextStyle = (newstype: string): TextStyle => {
    switch (newstype) {
      case 'breakingnews':
        return { color: '#fff' };
      case 'developingstory':
        return { color: '#000' };
      default:
        return {};
    }
  };

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('NewsDetail', { postId: breaking.id })
      }
    >
      <View style={[styles.banner, getViewStyle(breaking.type)]}>
        <Text style={[styles.bannerText, getTextStyle(breaking.type)]}>
          {breaking.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    padding: 8,
  },
  bannerText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default BreakingBanner;
