from rest_framework.filters import OrderingFilter

class MyCustomOrdering(OrderingFilter):

    def filter_queryset(self, request, queryset, view):

        map_ordering = request.query_params.get('map', None)

        # If we are retrieving SRs for the map, order by priority and animal count.
        if map_ordering:
            ordering = ['priority', '-id']
            return queryset.order_by(*ordering)

        return queryset