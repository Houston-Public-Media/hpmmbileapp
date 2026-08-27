import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fetchNewsByCategoryId } from '../services/newsApi';
import { NewsDetail } from '../type';
import { decodeHtmlEntities } from '../utils/htmlUtils';

type RootStackParamList = {
	CategoryList: { categoryId: number; categorySlug?: string; title?: string };
	NewsDetail: { postId: number; title?: string };
};

const { width: screenWidth } = Dimensions.get('window');

const stripHtml = (html: string) =>
	decodeHtmlEntities(html.replace(/<[^>]*>?/gm, ''));

type NavigationProp = StackNavigationProp<RootStackParamList, 'CategoryList'>;

interface CategorySectionProps {
	categoryId: string;
	categoryName: string;
}

const CategorySection = ({ categoryId, categoryName }: CategorySectionProps) => {
	const navigation = useNavigation<NavigationProp>();
	const [data, setData] = React.useState<NewsDetail[]>([]);

	useEffect(() => {
		const loadData = async () => {
			try {
				const result = await fetchNewsByCategoryId(Number(categoryId), 5);
				setData(result);
			} catch (error) {
				//console.error('Error loading category news:', error);
			}
		};

		loadData();
	}, [categoryId, setData]);

	const handleArticlePress = (articleId: number, title: string) => {
		navigation.navigate('NewsDetail', { postId: articleId, title: title });
	};

	const handleAllNewsByCategories = () => {
		navigation.navigate('CategoryList', {
			categoryId: Number(categoryId),
			title: categoryName || '',
		});
	};

	return (
		<View style={styles.newsContainer}>
			{data.map((item, idx) => (
				<View key={idx}>
					<Text style={styles.newsItem}>
						<Text onPress={handleAllNewsByCategories} style={styles.category}>{categoryName || 'News'} </Text>
						<Text onPress={() => handleArticlePress(item.id, item.title.rendered)}>{stripHtml(item.title.rendered)}</Text>
					</Text>
					<View style={styles.divider} />
				</View>
			))}
			<TouchableOpacity onPress={handleAllNewsByCategories} style={styles.seeAllButton}>
				<Text style={styles.seeAll}>View all</Text>
			</TouchableOpacity>
		</View>
	)
};
const mainFont = (screenWidth > 500 ? 18 : 14);
const styles = StyleSheet.create({
	newsContainer: {
		backgroundColor: '#fff',
		paddingVertical: 8,
		borderRadius: 10,
		marginTop: 8
	},
	newsItem: {
		fontSize: mainFont + 1,
		marginVertical: 6,
		color: '#222',
	},
	category: {
		fontWeight: 'bold',
		color: '#1976d2', // blue
		textTransform: 'uppercase',
		fontSize: mainFont,
	},
	divider: {
		borderBottomWidth: 1,
		borderBottomColor: '#ececec',
		marginVertical: 8,
	},
	seeAllButton: {
		padding: 8,
		alignSelf: 'flex-end',
	},
	seeAll: {
		color: '#1976d2',
		fontWeight: '500',
		fontSize: mainFont - 2,
	},
});

export default CategorySection;