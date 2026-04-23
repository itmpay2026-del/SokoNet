/**
 * Worker Home Screen - Mobile
 * Shows nearby jobs, active jobs, earnings summary
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
import Geolocation from 'react-native-geolocation-service';

export default function WorkerHomeScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [stats, setStats] = useState(null);
  const [nearbyJobs, setNearbyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  const fetchData = async () => {
    try {
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          const [statsRes, jobsRes] = await Promise.all([
            axios.get('http://localhost:5000/api/users/stats'),
            axios.get(`http://localhost:5000/api/jobs/nearby?latitude=${latitude}&longitude=${longitude}&radius=10`)
          ]);

          setStats(statsRes.data.stats);
          setNearbyJobs(jobsRes.data.jobs.slice(0, 10));
          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Worker Dashboard</Text>
        </View>

        {/* Stats */}
        {stats && (
          <View style={styles.statsContainer}>
            <StatCard
              title="Total Earnings"
              value={`KES ${stats.totalEarnings.toLocaleString()}`}
              color="#10B981"
            />
            <StatCard
              title="Completed Jobs"
              value={stats.completedJobs.toString()}
              color="#3B82F6"
            />
            <StatCard
              title="Rating"
              value={`⭐ ${stats.averageRating.toFixed(1)}`}
              color="#F59E0B"
            />
            <StatCard
              title="Escrow Balance"
              value={`KES ${stats.escrowBalance.toLocaleString()}`}
              color="#A855F7"
            />
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <ActionButton
            label="📍 Nearby Jobs"
            onPress={() => navigation.navigate('NearbyJobs')}
          />
          <ActionButton
            label="🎯 My Bids"
            onPress={() => navigation.navigate('MyBids')}
          />
          <ActionButton
            label="💰 Earnings"
            onPress={() => navigation.navigate('Earnings')}
          />
          <ActionButton
            label="✓ Verify Skills"
            onPress={() => navigation.navigate('Profile')}
          />
        </View>

        {/* Nearby Jobs */}
        <View style={styles.jobsSection}>
          <Text style={styles.sectionTitle}>Nearby Jobs</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#3B82F6" />
          ) : nearbyJobs.length > 0 ? (
            <FlatList
              scrollEnabled={false}
              data={nearbyJobs}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.jobCard}
                  onPress={() => navigation.navigate('JobDetail', { jobId: item._id })}
                >
                  <View>
                    <Text style={styles.jobTitle}>{item.title}</Text>
                    <Text style={styles.jobCity}>{item.city}</Text>
                    <View style={styles.jobFooter}>
                      <Text style={styles.jobBudget}>KES {item.budget?.max}</Text>
                      <View style={[
                        styles.urgencyBadge,
                        {
                          backgroundColor: item.urgency === 'urgent' ? '#FEE2E2' :
                            item.urgency === 'high' ? '#FEF3C7' : '#FEF08A'
                        }
                      ]}>
                        <Text style={[
                          styles.urgencyText,
                          {
                            color: item.urgency === 'urgent' ? '#991B1B' :
                              item.urgency === 'high' ? '#92400E' : '#78350F'
                          }
                        ]}>
                          {item.urgency}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Text style={styles.emptyText}>No nearby jobs</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ title, value, color }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

function ActionButton({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <Text style={styles.actionButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 20
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF'
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12
  },
  statCard: {
    backgroundColor: '#FFF',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14
  },
  jobsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12
  },
  jobCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4
  },
  jobCity: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  jobBudget: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669'
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '600'
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14
  }
});
