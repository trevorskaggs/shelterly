from rest_framework.filters import OrderingFilter

class MyCustomOrdering(OrderingFilter):

    def filter_queryset(self, request, queryset, view):

        map_ordering = request.query_params.get('landingmap', None)

        # If we are retrieving SRs for the map, order by priority and followup date.
        if map_ordering:
            ordering = ['priority', 'followup_date', '-id']
            return queryset.order_by(*ordering)

        return queryset