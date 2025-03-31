import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Text,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export interface SearchFilters {
  cookTime?: number;
  prepTime?: number;
  servings?: number;
  ingredients?: string[];
  collections?: string[];
  cuisine?: string;
}

interface Props {
  onSearch: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Search recipes...' }: Props) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  
  const timeOptions = [15, 30, 45, 60, 90, 120];
  const servingsOptions = [1, 2, 4, 6, 8, 10, 12];
  const cuisineOptions = [
    'Italian',
    'Chinese',
    'Japanese',
    'Mexican',
    'Indian',
    'French',
    'Mediterranean',
    'American',
    'Thai',
    'Korean'
  ];

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => {
      if (value === undefined || value === prev[key]) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
  };

  const renderTimeFilter = (title: string, key: 'prepTime' | 'cookTime') => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chipContainer}>
          {timeOptions.map(time => (
            <TouchableOpacity
              key={time}
              style={[
                styles.chip,
                filters[key] === time && styles.chipSelected
              ]}
              onPress={() => updateFilter(key, filters[key] === time ? undefined : time)}
            >
              <Text
                style={[
                  styles.chipText,
                  filters[key] === time && styles.chipTextSelected
                ]}
              >
                {time} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <FontAwesome
            name="sliders"
            size={20}
            color={Object.keys(filters).length > 0 ? '#4ECDC4' : '#666'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
        >
          <FontAwesome name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Recipes</Text>
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                style={styles.closeButton}
              >
                <FontAwesome name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {renderTimeFilter('Prep Time', 'prepTime')}
            {renderTimeFilter('Cook Time', 'cookTime')}

            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Servings</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {servingsOptions.map(servings => (
                    <TouchableOpacity
                      key={servings}
                      style={[
                        styles.chip,
                        filters.servings === servings && styles.chipSelected
                      ]}
                      onPress={() => updateFilter('servings', filters.servings === servings ? undefined : servings)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          filters.servings === servings && styles.chipTextSelected
                        ]}
                      >
                        {servings}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Cuisine</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {cuisineOptions.map(cuisine => (
                    <TouchableOpacity
                      key={cuisine}
                      style={[
                        styles.chip,
                        filters.cuisine === cuisine && styles.chipSelected
                      ]}
                      onPress={() => updateFilter('cuisine', filters.cuisine === cuisine ? undefined : cuisine)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          filters.cuisine === cuisine && styles.chipTextSelected
                        ]}
                      >
                        {cuisine}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setFilters({})}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  setShowFilters(false);
                  handleSearch();
                }}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
  },
  chipSelected: {
    backgroundColor: '#4ECDC4',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  chipTextSelected: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
    paddingTop: 16,
    paddingBottom: 16,
  },
  clearButton: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#4ECDC4',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
}); 