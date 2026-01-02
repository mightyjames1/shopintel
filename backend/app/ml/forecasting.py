import pandas as pd
import numpy as np
from prophet import Prophet
from prophet.diagnostics import cross_validation, performance_metrics
import json
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

class SalesForecaster:
    def __init__(self):
        self.model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            seasonality_mode='multiplicative',
            changepoint_prior_scale=0.05,
            seasonality_prior_scale=10.0
        )
        
    def prepare_data(self, sales_data: pd.DataFrame) -> pd.DataFrame:
        """Prepare sales data for Prophet"""
        df = sales_data.copy()
        
        # Aggregate by date
        df['ds'] = pd.to_datetime(df['sale_date'])
        df['y'] = df['quantity'].astype(float)
        
        # Group by date
        prophet_df = df.groupby('ds')['y'].sum().reset_index()
        
        # Add product categories as extra regressors if available
        if 'category' in df.columns:
            category_dummies = pd.get_dummies(df['category'], prefix='cat')
            df = pd.concat([df, category_dummies], axis=1)
            
            # Aggregate regressors by date
            regressor_cols = [col for col in df.columns if col.startswith('cat_')]
            if regressor_cols:
                regressors = df.groupby('ds')[regressor_cols].mean().reset_index()
                prophet_df = pd.merge(prophet_df, regressors, on='ds', how='left')
                
                # Add regressors to model
                for reg in regressor_cols:
                    prophet_df[reg] = prophet_df[reg].fillna(0)
                    self.model.add_regressor(reg)
        
        return prophet_df
    
    def train(self, historical_data: pd.DataFrame) -> Dict[str, Any]:
        """Train the forecasting model"""
        try:
            # Prepare data
            prophet_df = self.prepare_data(historical_data)
            
            # Train model
            self.model.fit(prophet_df)
            
            # Cross-validation
            df_cv = cross_validation(
                self.model,
                initial='180 days',
                period='30 days',
                horizon='30 days'
            )
            
            # Calculate metrics
            df_p = performance_metrics(df_cv)
            metrics = {
                'mape': df_p['mape'].mean(),
                'rmse': df_p['rmse'].mean(),
                'mae': df_p['mae'].mean()
            }
            
            return {
                'success': True,
                'metrics': metrics,
                'data_points': len(prophet_df)
            }
            
        except Exception as e:
            logger.error(f"Error training model: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def forecast(self, periods: int = 30) -> Dict[str, Any]:
        """Generate forecast for future periods"""
        try:
            # Create future dataframe
            future = self.model.make_future_dataframe(periods=periods)
            
            # Add regressors if they exist
            regressor_cols = [col for col in self.model.extra_regressors.keys()]
            if regressor_cols:
                # For simplicity, use last known values for regressors
                for reg in regressor_cols:
                    future[reg] = 0.5  # Default value, should be improved
            
            # Make predictions
            forecast = self.model.predict(future)
            
            # Extract forecast data
            forecast_data = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(periods)
            
            # Format results
            results = {
                'dates': forecast_data['ds'].dt.strftime('%Y-%m-%d').tolist(),
                'predictions': forecast_data['yhat'].round(2).tolist(),
                'lower_bound': forecast_data['yhat_lower'].round(2).tolist(),
                'upper_bound': forecast_data['yhat_upper'].round(2).tolist(),
                'confidence': 0.95
            }
            
            # Generate business insights
            insights = self._generate_insights(forecast_data)
            
            return {
                'success': True,
                'forecast': results,
                'insights': insights,
                'periods': periods
            }
            
        except Exception as e:
            logger.error(f"Error generating forecast: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _generate_insights(self, forecast_data: pd.DataFrame) -> List[Dict[str, Any]]:
        """Generate business insights from forecast"""
        insights = []
        
        # Calculate trend
        first_pred = forecast_data['yhat'].iloc[0]
        last_pred = forecast_data['yhat'].iloc[-1]
        trend_percentage = ((last_pred - first_pred) / first_pred) * 100
        
        if trend_percentage > 10:
            insights.append({
                'type': 'positive_trend',
                'message': 'Strong upward trend detected. Consider increasing inventory.',
                'severity': 'high',
                'action': 'increase_stock'
            })
        elif trend_percentage < -10:
            insights.append({
                'type': 'negative_trend',
                'message': 'Downward trend detected. Consider reducing inventory.',
                'severity': 'high',
                'action': 'reduce_stock'
            })
        
        # Detect seasonality patterns
        # (Add more sophisticated pattern detection here)
        
        return insights