/**
 * Customer Home Screen - Mobile
 * Quick access to services and recent jobs
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';

export default function CustomerHomeScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFocused) {
      fetchRecentJobs();
    }
  }, [isFocused]);

  const fetchRecentJobs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/jobs/my-jobs');
      setRecentJobs(res.data.jobs.slice(0, 5));
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickCategories = [
    { icon: '🔧', label: 'Plumbing', category: 'plumbing' },
    { icon: '🧹', label: 'Cleaning', category: 'cleaning' },
    { icon: '📦', label: 'Delivery', category: 'delivery' },
    { icon: '🛠️', label: 'Handyman', category: 'handyman' },
    { icon: '✂️', label: 'Beauty', category: 'beauty' },
    { icon: '📚', label: 'Tutoring', category: 'tutoring' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome to SokoNet</Text>
          <Text style={styles.subtitle}>Find trusted service providers</Text>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.searchPlaceholder}>🔍 Search for services...</Text>
        </TouchableOpacity>

        {/* Quick Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Popular Services</Text>
          <View style={styles.categoriesGrid}>
            {quickCategories.map((cat) => (
              <TouchableOpacity
                key={cat.category}
                style={styles.categoryCard}
                onPress={() => navigation.navigate('Search')}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Post New Job */}
        <TouchableOpacity
          style={styles.postJobButton}
          onPress={() => navigation.navigate('CreateJob')}
        >
          <Text style={styles.postJobButtonText}>📋 Post New Job</Text>
        </TouchableOpacity>

        {/* Recent Jobs */}
        <View style={styles.jobsSection}>
          <Text style={styles.sectionTitle}>Your Recent Jobs</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#3B82F6" />
          ) : recentJobs.length > 0 ? (
            <FlatList
              scrollEnabled={false}
              data={recentJobs}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.jobCard}
                  onPress={() => navigation.navigate('JobDetail', { jobId: item._id })}
                >
                  <View style={styles.jobHeader}>
                    <Text style={styles.jobTitle}>{item.title}</Text>
                    <View style={[
                      styles.statusBadge,
                      {
                        backgroundColor: item.status === 'posted' ? '#FEF3C7' :
                          item.status === 'accepted' ? '#DBEAFE' :
                          item.status === 'completed' ? '#DCFCE7' : '#F3F4F6'
                      }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        {
                          color: item.status === 'posted' ? '#92400E' :
                            item.status === 'accepted' ? '#0369A1' :
                            item.status === 'completed' ? '#15803D' : '#374151'
                        }
                      ]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.jobCity}>📍 {item.city}</Text>
                  <Text style={styles.jobBudget}>💰 KES {item.budget?.max}</Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No jobs yet</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CreateJob')}>
                <Text style={styles.emptyLink}>Post your first job →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    backgroundColor: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
    paddingHorizontal: 16,
    paddingVertical: 20
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#E0E7FF'
  },
  searchBar: {
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3
  },
  searchPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF'
  },
  categoriesSection: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between'
  },
  categoryCard: {
    width: '30%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center'
  },
  postJobButton: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3
  },
  postJobButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  },
  jobsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  jobCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600'
  },
  jobCity: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4
  },
  jobBudget: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 8
  },
  emptyLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600'
  }
});
