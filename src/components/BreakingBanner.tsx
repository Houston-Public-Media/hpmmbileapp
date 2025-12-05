import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle, TextStyle} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { fetchBreaking } from '../services/newsApi';

type Breaking = {
  id: number;
  title: string;
  type: string;
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

const BreakingBanner: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [breaking, setBreaking] = useState<Breaking>({
    id: 0,
    title: '',
    type: '',
  });

  useEffect(() => {
    fetchBreaking().then(data => {
      setBreaking(data);
    });
  }, []);

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

  // ✅ Conditionally render only if there's valid breaking news
  const shouldShowBanner = breaking && breaking.id !== 0 && breaking.title !== '';

  if (!shouldShowBanner) {
    return null;
  }

  return (
    <TouchableOpacity onPress={() => navigation.navigate('NewsDetail', { postId: breaking.id })}>
      <View style={[styles.banner, getViewStyle(breaking.type)]}>
        <Text style={[styles.bannerText, getTextStyle(breaking.type)]}>
          {breaking.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default BreakingBanner;
